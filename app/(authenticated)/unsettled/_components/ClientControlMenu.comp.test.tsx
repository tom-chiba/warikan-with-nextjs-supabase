import { server } from "@/tests/mocks/node";
import { TSQWrapper } from "@/tests/vitest/setup";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse, type PathParams } from "msw";
import { describe, expect, it, vi } from "vitest";
import ClientControlMenu from "./ClientControlMenu";

describe("ClientControlMenu", () => {
	it("精算・編集・削除ボタンが表示される", async () => {
		render(<ClientControlMenu purchaseId={1} />, { wrapper: TSQWrapper });
		// メニューを開く
		const trigger = screen.getByRole("button");
		expect(trigger).toBeInTheDocument();
		await userEvent.click(trigger);
		expect(await screen.findByText("精算")).toBeInTheDocument();
		expect(await screen.findByText("編集")).toBeInTheDocument();
		expect(await screen.findByText("削除")).toBeInTheDocument();
	});

	it("精算ボタンでPATCH APIが正しいボディで呼ばれる", async () => {
		const patchSpy = vi.fn();
		server.use(
			http.patch<PathParams, Record<string, unknown>, Record<string, unknown>>(
				"*/rest/v1/purchases*",
				async ({ request }) => {
					const body = await request.json();
					patchSpy(body);
					return HttpResponse.json({});
				},
			),
		);
		render(<ClientControlMenu purchaseId={1} />, { wrapper: TSQWrapper });
		const trigger = screen.getByRole("button");
		await userEvent.click(trigger);
		const settleButton = await screen.findByText("精算");
		await userEvent.click(settleButton);
		await waitFor(() => {
			expect(patchSpy).toHaveBeenCalledWith(
				expect.objectContaining({ is_settled: true }),
			);
		});
	});

	it("削除メニュー項目をクリックすると確認ダイアログが表示される", async () => {
		render(<ClientControlMenu purchaseId={1} purchaseTitle="テスト購入品" />, {
			wrapper: TSQWrapper,
		});

		const trigger = screen.getByRole("button");
		await userEvent.click(trigger);

		const deleteMenuItem = await screen.findByText("削除");
		await userEvent.click(deleteMenuItem);

		const dialog = await screen.findByRole("alertdialog");
		expect(dialog).toBeInTheDocument();
		expect(screen.getByText("購入品を削除")).toBeInTheDocument();
		expect(
			screen.getByText(/「テスト購入品」を削除しますか？/),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "キャンセル" }),
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /^削除$/ })).toBeInTheDocument();
	});

	it("削除ボタンでDELETE APIが正しいクエリで呼ばれる", async () => {
		const deleteSpy = vi.fn();
		server.use(
			http.delete<PathParams, Record<string, unknown>, Record<string, unknown>>(
				"*/rest/v1/purchases*",
				async ({ request }) => {
					const url = new URL(request.url);
					deleteSpy(url.searchParams.get("id"));
					return HttpResponse.json({});
				},
			),
		);
		render(<ClientControlMenu purchaseId={1} purchaseTitle="テスト購入品" />, {
			wrapper: TSQWrapper,
		});

		const trigger = screen.getByRole("button");
		await userEvent.click(trigger);

		const deleteMenuItem = await screen.findByText("削除");
		await userEvent.click(deleteMenuItem);

		const dialog = await screen.findByRole("alertdialog");
		const confirmDeleteButton = within(dialog).getByRole("button", {
			name: "削除",
		});
		await userEvent.click(confirmDeleteButton);

		await waitFor(() => {
			expect(deleteSpy).toHaveBeenCalledWith("eq.1");
		});
	});

	it("精算mutation実行後、queryが無効化される", async () => {
		const patchSpy = vi.fn();
		server.use(
			http.patch<PathParams, Record<string, unknown>>(
				"*/rest/v1/purchases*",
				async ({ request }) => {
					const body = await request.json();
					patchSpy(body);
					return HttpResponse.json([{ id: 1, is_settled: true }]);
				},
			),
		);

		render(<ClientControlMenu purchaseId={1} />, { wrapper: TSQWrapper });

		const trigger = screen.getByRole("button");
		await userEvent.click(trigger);
		const settleButton = await screen.findByText("精算");
		await userEvent.click(settleButton);

		await waitFor(() => {
			expect(patchSpy).toHaveBeenCalledWith(
				expect.objectContaining({ is_settled: true }),
			);
		});
	});

	it("削除mutation実行後、queryが無効化される", async () => {
		const deleteSpy = vi.fn();
		server.use(
			http.delete<PathParams, Record<string, unknown>>(
				"*/rest/v1/purchases*",
				async ({ request }) => {
					const url = new URL(request.url);
					deleteSpy(url.searchParams.get("id"));
					return HttpResponse.json({});
				},
			),
		);

		render(<ClientControlMenu purchaseId={1} />, { wrapper: TSQWrapper });

		const trigger = screen.getByRole("button");
		await userEvent.click(trigger);

		const deleteMenuItem = await screen.findByText("削除");
		await userEvent.click(deleteMenuItem);

		const dialog = await screen.findByRole("alertdialog");
		const confirmDeleteButton = within(dialog).getByRole("button", {
			name: "削除",
		});
		await userEvent.click(confirmDeleteButton);

		await waitFor(() => {
			expect(deleteSpy).toHaveBeenCalledWith("eq.1");
		});
	});

	it("精算mutation実行中、Loader2アイコンが表示される", async () => {
		server.use(
			http.patch("*/rest/v1/purchases*", async () => {
				await new Promise((resolve) => setTimeout(resolve, 100));
				return HttpResponse.json([{ id: 1, is_settled: true }]);
			}),
		);

		render(<ClientControlMenu purchaseId={1} />, { wrapper: TSQWrapper });
		const trigger = screen.getByRole("button");
		await userEvent.click(trigger);
		const settleButton = await screen.findByText("精算");
		await userEvent.click(settleButton);

		await waitFor(() => {
			expect(screen.queryByText("精算中...")).not.toBeInTheDocument();
		});

		const triggerAfterClick = screen.getByRole("button");
		await userEvent.click(triggerAfterClick);

		await waitFor(() => {
			expect(screen.getByLabelText("読み込み中")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByLabelText("読み込み中")).not.toBeInTheDocument();
		});
	});

	it("削除mutation実行中、Loader2アイコンが表示される", async () => {
		server.use(
			http.delete("*/rest/v1/purchases*", async () => {
				await new Promise((resolve) => setTimeout(resolve, 100));
				return HttpResponse.json({});
			}),
		);

		render(<ClientControlMenu purchaseId={1} />, { wrapper: TSQWrapper });

		const trigger = screen.getByRole("button");
		await userEvent.click(trigger);

		const deleteMenuItem = await screen.findByText("削除");
		await userEvent.click(deleteMenuItem);

		const dialog = await screen.findByRole("alertdialog");
		const confirmDeleteButton = within(dialog).getByRole("button", {
			name: "削除",
		});
		await userEvent.click(confirmDeleteButton);

		await waitFor(() => {
			expect(within(dialog).getByLabelText("読み込み中")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
		});
	});
});
