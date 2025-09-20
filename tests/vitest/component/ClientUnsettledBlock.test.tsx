import ClientUnsettledBlock from "@/app/(authenticated)/unsettled/_components/ClientUnsettledBlock";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TSQWrapper, user } from "../setup";

const initialPurchases = [
	{
		id: 1,
		title: "テスト購入1",
		purchase_date: "2025-09-20",
		note: "メモ1",
		is_settled: false,
		purchasers_purchases: [
			{ id: 1, purchaser_id: 1, amount_paid: 1000, amount_to_pay: 500 },
			{ id: 2, purchaser_id: 2, amount_paid: 0, amount_to_pay: 500 },
		],
	},
	{
		id: 2,
		title: "テスト購入2",
		purchase_date: "2025-09-19",
		note: "メモ2",
		is_settled: false,
		purchasers_purchases: [
			{ id: 3, purchaser_id: 1, amount_paid: 500, amount_to_pay: 250 },
			{ id: 4, purchaser_id: 2, amount_paid: 0, amount_to_pay: 250 },
		],
	},
];

describe("ClientUnsettledBlock", () => {
	it("未精算の購入品一覧が表示される", () => {
		render(<ClientUnsettledBlock initialPurchases={initialPurchases} />, {
			wrapper: TSQWrapper,
		});
		expect(screen.getByText("テスト購入1")).toBeInTheDocument();
		expect(screen.getByText("テスト購入2")).toBeInTheDocument();
	});

	it("データがない場合はNodataMessageが表示される", () => {
		render(<ClientUnsettledBlock initialPurchases={[]} />, {
			wrapper: TSQWrapper,
		});
		expect(screen.getByText("データがありません")).toBeInTheDocument();
	});

	it("購入品を選択してまとめて精算ボタンが有効化される", async () => {
		render(<ClientUnsettledBlock initialPurchases={initialPurchases} />, {
			wrapper: TSQWrapper,
		});
		// チェックボックスをクリック
		const checkboxes = screen.getAllByRole("checkbox");
		await user.click(checkboxes[1]); // 1つ目の購入品を選択
		expect(
			screen.getByRole("button", { name: "まとめて精算" }),
		).not.toBeDisabled();
	});
});
