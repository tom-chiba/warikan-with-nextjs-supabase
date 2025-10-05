import { server } from "@/tests/mocks/node";
import { TSQWrapper } from "@/tests/vitest/setup";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse, type PathParams } from "msw";
import { describe, expect, it, vi } from "vitest";
import ClientControlMenu from "./ClientControlMenu";

describe("ClientControlMenu", () => {
	it("未精算・編集・削除ボタンが表示される", async () => {
		render(<ClientControlMenu purchaseId={1} />, { wrapper: TSQWrapper });
		// メニューを開く
		const trigger = screen.getByRole("button");
		expect(trigger).toBeInTheDocument();
		await userEvent.click(trigger);
		expect(await screen.findByText("未精算")).toBeInTheDocument();
		expect(await screen.findByText("編集")).toBeInTheDocument();
		expect(await screen.findByText("削除")).toBeInTheDocument();
	});

	it("未精算ボタンでPATCH APIが正しいボディで呼ばれる", async () => {
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
		const settleButton = await screen.findByText("未精算");
		await userEvent.click(settleButton);
		await waitFor(() => {
			expect(patchSpy).toHaveBeenCalledWith(
				expect.objectContaining({ is_settled: false }),
			);
		});
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
		render(<ClientControlMenu purchaseId={1} />, { wrapper: TSQWrapper });
		const trigger = screen.getByRole("button");
		await userEvent.click(trigger);
		const deleteButton = await screen.findByText("削除");
		await userEvent.click(deleteButton);
		await waitFor(() => {
			expect(deleteSpy).toHaveBeenCalledWith("eq.1");
		});
	});

	it("未精算mutation実行中、Loader2アイコンが表示される", async () => {
		let resolveRequest: ((value: unknown) => void) | undefined;
		const requestPromise = new Promise((resolve) => {
			resolveRequest = resolve;
		});

		server.use(
			http.patch("*/rest/v1/purchases*", async () => {
				await requestPromise;
				return HttpResponse.json([{ id: 1, is_settled: false }]);
			}),
		);

		render(<ClientControlMenu purchaseId={1} />, { wrapper: TSQWrapper });
		const trigger = screen.getByRole("button");
		await userEvent.click(trigger);
		const unsettleButton = await screen.findByText("未精算");
		await userEvent.click(unsettleButton);

		// mutation実行中は"処理中..."ではなくLoader2アイコンが表示される
		await waitFor(() => {
			expect(screen.queryByText("処理中...")).not.toBeInTheDocument();
		});

		// ドロップダウンメニューを再度開いて確認
		const triggerAfterClick = screen.getByRole("button");
		await userEvent.click(triggerAfterClick);

		// animate-spinクラスを持つsvg要素が存在する
		await waitFor(() => {
			const spinner = document.querySelector("svg.animate-spin");
			expect(spinner).toBeInTheDocument();
		});

		// リクエストを完了させる
		if (resolveRequest) resolveRequest(null);
	});

	it("削除mutation実行中、Loader2アイコンが表示される", async () => {
		let resolveRequest: ((value: unknown) => void) | undefined;
		const requestPromise = new Promise((resolve) => {
			resolveRequest = resolve;
		});

		server.use(
			http.delete("*/rest/v1/purchases*", async () => {
				await requestPromise;
				return HttpResponse.json({});
			}),
		);

		render(<ClientControlMenu purchaseId={1} />, { wrapper: TSQWrapper });
		const trigger = screen.getByRole("button");
		await userEvent.click(trigger);
		const deleteButton = await screen.findByText("削除");
		await userEvent.click(deleteButton);

		// mutation実行中は"削除中..."ではなくLoader2アイコンが表示される
		await waitFor(() => {
			expect(screen.queryByText("削除中...")).not.toBeInTheDocument();
		});

		// ドロップダウンメニューを再度開いて確認
		const triggerAfterClick = screen.getByRole("button");
		await userEvent.click(triggerAfterClick);

		// animate-spinクラスを持つsvg要素が存在する
		await waitFor(() => {
			const spinner = document.querySelector("svg.animate-spin");
			expect(spinner).toBeInTheDocument();
		});

		// リクエストを完了させる
		if (resolveRequest) resolveRequest(null);
	});
});
