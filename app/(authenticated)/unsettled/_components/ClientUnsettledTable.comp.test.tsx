import { render, screen, within } from "@testing-library/react";
import { HttpResponse, http, type PathParams } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/tests/mocks/node";
import { TSQWrapper, user } from "@/tests/vitest/setup";
import ClientUnsettledTable from "./ClientUnsettledTable";

const initialPurchases = [
	{
		id: 1,
		title: "未精算購入1",
		purchase_date: "2025-09-20",
		note: "メモA",
		is_settled: false,
		purchasers_purchases: [
			{ id: 1, purchaser_id: 1, amount_paid: 1000, amount_to_pay: 500 },
			{ id: 2, purchaser_id: 2, amount_paid: 0, amount_to_pay: 500 },
		],
	},
	{
		id: 2,
		title: "未精算購入2",
		purchase_date: "2025-09-19",
		note: "メモB",
		is_settled: false,
		purchasers_purchases: [
			{ id: 3, purchaser_id: 1, amount_paid: 500, amount_to_pay: 250 },
			{ id: 4, purchaser_id: 2, amount_paid: 0, amount_to_pay: 250 },
		],
	},
];

describe("ClientUnsettledTable", () => {
	it("未精算の購入品一覧が表示される", () => {
		render(
			<ClientUnsettledTable
				selectedPurchaseIds={[]}
				onSelectPurchases={() => {}}
				initialPurchases={initialPurchases}
			/>,
			{ wrapper: TSQWrapper },
		);
		expect(screen.getByText("未精算購入1")).toBeInTheDocument();
		expect(screen.getByText("未精算購入2")).toBeInTheDocument();
	});

	it("データがない場合はNodataMessageが表示される", () => {
		render(
			<ClientUnsettledTable
				selectedPurchaseIds={[]}
				onSelectPurchases={() => {}}
				initialPurchases={[]}
			/>,
			{ wrapper: TSQWrapper },
		);
		expect(screen.getByText("データがありません")).toBeInTheDocument();
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

		render(
			<ClientUnsettledTable
				selectedPurchaseIds={[]}
				onSelectPurchases={() => {}}
				initialPurchases={initialPurchases}
			/>,
			{ wrapper: TSQWrapper },
		);

		const menuButtons = screen.getAllByRole("button");
		await user.click(menuButtons[0]);
		const settleButton = await screen.findByText("精算");
		await user.click(settleButton);

		await screen.findByText("未精算購入1");

		expect(patchSpy).toHaveBeenCalledWith(
			expect.objectContaining({ is_settled: true }),
		);
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

		render(
			<ClientUnsettledTable
				selectedPurchaseIds={[]}
				onSelectPurchases={() => {}}
				initialPurchases={initialPurchases}
			/>,
			{ wrapper: TSQWrapper },
		);

		const menuButtons = screen.getAllByRole("button");
		await user.click(menuButtons[0]);

		const deleteMenuItem = await screen.findByText("削除");
		await user.click(deleteMenuItem);

		const dialog = await screen.findByRole("alertdialog");
		const confirmDeleteButton = within(dialog).getByRole("button", {
			name: "削除",
		});
		await user.click(confirmDeleteButton);

		await screen.findByText("未精算購入2");

		expect(deleteSpy).toHaveBeenCalledWith("eq.1");
	});
});
