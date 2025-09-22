import ClientPurchasersTable from "@/app/(authenticated)/member/_components/ClientPurchasersTable";
import type { Database } from "@/database.types";
import { server } from "@/tests/mocks/node";
import { TSQWrapper, user } from "@/tests/vitest/setup";
import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse, type PathParams } from "msw";
import { describe, expect, it, vi } from "vitest";

type PurchaserInsert = Database["public"]["Tables"]["purchasers"]["Insert"];
type Purchaser = Database["public"]["Tables"]["purchasers"]["Row"];

const initialPurchasers = [
	{ id: 1, name: "Alice" },
	{ id: 2, name: "Bob" },
];

describe("ClientPurchasersTable", () => {
	it("初期購入者が表示されるべき", () => {
		render(<ClientPurchasersTable initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});
		expect(screen.getByText("Alice")).toBeInTheDocument();
		expect(screen.getByText("Bob")).toBeInTheDocument();
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
					// id=eq.1 の形式なので数値部分だけ抜き出す
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
			body: { name: "Alice (edited)" },
		});
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
		expect(deleteRequestSpy).toHaveBeenCalledWith("1");
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
		expect(screen.getByText("Alice")).toBeInTheDocument();
		expect(screen.getByText("Bob")).toBeInTheDocument();
		await user.click(screen.getByText("追加"));
		await user.type(screen.getByRole("textbox"), "Charlie");
		await user.click(screen.getByRole("button", { name: /Save/i }));
		await waitFor(() => {
			expect(postRequestSpy).toHaveBeenCalledWith({ name: "Charlie" });
		});
	});
});
