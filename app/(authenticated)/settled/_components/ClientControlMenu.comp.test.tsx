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
});
