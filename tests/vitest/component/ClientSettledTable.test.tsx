import ClientSettledTable from "@/app/(authenticated)/settled/_components/ClientSettledTable";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TSQWrapper } from "../setup";

const initialPurchasers = [
	{ id: 1, name: "John" },
	{ id: 2, name: "Jane" },
];

const initialPurchases = [
	{
		id: 1,
		title: "精算済み購入1",
		purchase_date: "2025-09-18",
		note: "メモA",
		is_settled: true,
		purchasers_purchases: [
			{ id: 1, purchaser_id: 1, amount_paid: 1000, amount_to_pay: 500 },
			{ id: 2, purchaser_id: 2, amount_paid: 0, amount_to_pay: 500 },
		],
	},
	{
		id: 2,
		title: "精算済み購入2",
		purchase_date: "2025-09-17",
		note: "メモB",
		is_settled: true,
		purchasers_purchases: [
			{ id: 3, purchaser_id: 1, amount_paid: 500, amount_to_pay: 250 },
			{ id: 4, purchaser_id: 2, amount_paid: 0, amount_to_pay: 250 },
		],
	},
];

describe("ClientSettledTable", () => {
	it("精算済みの購入品一覧が表示される", () => {
		render(
			<ClientSettledTable
				initialPurchases={initialPurchases}
				initialPurchasers={initialPurchasers}
			/>,
			{
				wrapper: TSQWrapper,
			},
		);
		expect(screen.getByText("精算済み購入1")).toBeInTheDocument();
		expect(screen.getByText("精算済み購入2")).toBeInTheDocument();
	});

	it("データがない場合はNodataMessageが表示される", () => {
		render(
			<ClientSettledTable
				initialPurchases={[]}
				initialPurchasers={initialPurchasers}
			/>,
			{
				wrapper: TSQWrapper,
			},
		);
		expect(screen.getByText("データがありません")).toBeInTheDocument();
	});
});
