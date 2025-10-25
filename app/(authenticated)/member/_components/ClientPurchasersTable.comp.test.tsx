import ClientPurchasersTable from "@/app/(authenticated)/member/_components/ClientPurchasersTable";
import type { Database } from "@/database.types";
import { server } from "@/tests/mocks/node";
import { TSQWrapper, user } from "@/tests/vitest/setup";
import { render, screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse, type PathParams } from "msw";
import { describe, expect, it, vi } from "vitest";

type PurchaserInsert = Database["public"]["Tables"]["purchasers"]["Insert"];
type Purchaser = Database["public"]["Tables"]["purchasers"]["Row"];

const initialPurchasers = [
	{ id: 1, name: "John" },
	{ id: 2, name: "Jane" },
];

describe("ClientPurchasersTable", () => {
	it("同名のメンバーは追加できず、エラーメッセージが表示される", async () => {
		render(<ClientPurchasersTable initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});
		await user.click(screen.getByText("追加"));
		await user.type(screen.getByRole("textbox"), "John");
		await user.click(screen.getByRole("button", { name: /Save/i }));
		// 既に存在する名前なのでエラーが表示されることを期待
		expect(
			await screen.findByText("同じ名前のメンバーが既に存在します"),
		).toBeInTheDocument();
	});

	it("既存メンバー名に編集した場合はエラーが表示される", async () => {
		render(<ClientPurchasersTable initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});
		// JaneをJohnに変更しようとする
		await user.click(screen.getAllByRole("button", { name: /Edit/i })[1]);
		expect(await screen.findByRole("textbox")).toBeInTheDocument();
		await user.clear(screen.getByRole("textbox"));
		await user.type(screen.getByRole("textbox"), "John");
		await user.click(screen.getByRole("button", { name: /Save/i }));
		// 既に存在する名前なのでエラーが表示されることを期待
		expect(
			await screen.findByText("同じ名前のメンバーが既に存在します"),
		).toBeInTheDocument();
	});
	it("初期購入者が表示されるべき", () => {
		render(<ClientPurchasersTable initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});
		expect(screen.getByText("John")).toBeInTheDocument();
		expect(screen.getByText("Jane")).toBeInTheDocument();
	});

	it("新しい購入者が追加されるとAPIリクエストが正しく送信される", async () => {
		const postRequestSpy = vi.fn();
		server.use(
			http.post<PathParams, PurchaserInsert, Purchaser>(
				"*/rest/v1/purchasers*",
				async ({ request }) => {
					const body = await request.json();
					postRequestSpy(body);
					return HttpResponse.json(
						{
							...body,
							id: 3,
							created_at: new Date().toISOString(),
							user_id: "",
						},
						{ status: 201 },
					);
				},
			),
		);
		render(<ClientPurchasersTable initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});
		await user.click(screen.getByText("追加"));
		await user.type(screen.getByRole("textbox"), "Charlie");
		await user.click(screen.getByRole("button", { name: /Save/i }));
		await waitFor(() => {
			expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
		});
		// APIリクエストの内容を検証
		expect(postRequestSpy).toHaveBeenCalledWith({ name: "Charlie" });
	});

	it("購入者が編集されるとAPIリクエストが正しく送信される", async () => {
		const patchRequestSpy = vi.fn();
		server.use(
			http.patch<PathParams, PurchaserInsert, Purchaser>(
				"*/rest/v1/purchasers*",
				async ({ request }) => {
					const body = await request.json();
					const url = new URL(request.url);
					const idParam = url.searchParams.get("id");
					const id = idParam ? idParam.replace("eq.", "") : undefined;
					patchRequestSpy({ id, body });
					return HttpResponse.json({
						...body,
						id: Number(id),
						created_at: new Date().toISOString(),
						user_id: "",
					});
				},
			),
		);
		render(<ClientPurchasersTable initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});
		await user.click(screen.getAllByRole("button", { name: /Edit/i })[0]);
		expect(await screen.findByRole("textbox")).toBeInTheDocument();
		await user.type(screen.getByRole("textbox"), " (edited)");
		await user.click(screen.getByRole("button", { name: /Save/i }));
		await waitFor(() => {
			expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
		});
		expect(patchRequestSpy).toHaveBeenCalledWith({
			id: "1",
			body: { name: "John (edited)" },
		});
	});

	it("削除ボタンをクリックすると確認ダイアログが表示される", async () => {
		render(<ClientPurchasersTable initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});
		await user.click(screen.getAllByRole("button", { name: /Delete/i })[0]);

		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
		expect(screen.getByText("メンバーを削除")).toBeInTheDocument();
		expect(screen.getByText(/「John」を削除しますか？/)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "キャンセル" }),
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /^削除$/ })).toBeInTheDocument();
	});

	it("キャンセルボタンをクリックするとダイアログが閉じて削除されない", async () => {
		const deleteRequestSpy = vi.fn();
		server.use(
			http.delete("*/rest/v1/purchasers*", async () => {
				deleteRequestSpy();
				return new HttpResponse(null, { status: 204 });
			}),
		);
		render(<ClientPurchasersTable initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});

		await user.click(screen.getAllByRole("button", { name: /Delete/i })[0]);
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: "キャンセル" }));

		await waitFor(() => {
			expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
		});

		expect(deleteRequestSpy).not.toHaveBeenCalled();
		expect(screen.getByText("John")).toBeInTheDocument();
	});

	it("購入者が削除されるとAPIリクエストが正しく送信される", async () => {
		const deleteRequestSpy = vi.fn();
		server.use(
			http.delete("*/rest/v1/purchasers*", async ({ request }) => {
				const url = new URL(request.url);
				const idParam = url.searchParams.get("id");
				const id = idParam ? idParam.replace("eq.", "") : undefined;
				deleteRequestSpy(id);
				return new HttpResponse(null, { status: 204 });
			}),
		);
		render(<ClientPurchasersTable initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});
		await user.click(screen.getAllByRole("button", { name: /Delete/i })[0]);
		await user.click(screen.getByRole("button", { name: /^削除$/ }));

		await waitFor(() => {
			expect(deleteRequestSpy).toHaveBeenCalledWith("1");
		});
	});

	it("mutation時にAPIリクエストが正しく送信される", async () => {
		const postRequestSpy = vi.fn();
		server.use(
			http.post<PathParams, PurchaserInsert, Purchaser>(
				"*/rest/v1/purchasers*",
				async ({ request }) => {
					const body = await request.json();
					postRequestSpy(body);
					return HttpResponse.json(
						{
							...body,
							id: 3,
							created_at: new Date().toISOString(),
							user_id: "",
						},
						{ status: 201 },
					);
				},
			),
		);
		render(<ClientPurchasersTable initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});
		expect(screen.getByText("John")).toBeInTheDocument();
		expect(screen.getByText("Jane")).toBeInTheDocument();
		await user.click(screen.getByText("追加"));
		await user.type(screen.getByRole("textbox"), "Charlie");
		await user.click(screen.getByRole("button", { name: /Save/i }));
		await waitFor(() => {
			expect(postRequestSpy).toHaveBeenCalledWith({ name: "Charlie" });
		});
	});

	it("削除実行中、ダイアログの削除ボタンにLoader2アイコンが表示される", async () => {
		server.use(
			http.delete("*/rest/v1/purchasers*", async () => {
				await new Promise((resolve) => setTimeout(resolve, 100));
				return new HttpResponse(null, { status: 204 });
			}),
		);

		render(<ClientPurchasersTable initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});

		await user.click(screen.getAllByRole("button", { name: /Delete/i })[0]);
		const dialog = await screen.findByRole("alertdialog");
		const deleteButton = within(dialog).getByRole("button", { name: "削除" });
		await user.click(deleteButton);

		await waitFor(() => {
			expect(within(dialog).getByLabelText("読み込み中")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
		});
	});

	it("追加ボタン押下で新規入力欄が表示され、即座にフォーカスされる", async () => {
		render(<ClientPurchasersTable initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});
		await user.click(screen.getByText("追加"));
		const textbox = await screen.findByRole("textbox");
		expect(textbox).toHaveFocus();
	});
});
