import ClientUnsettledBlock from "@/app/(authenticated)/unsettled/_components/ClientUnsettledBlock";
import type { Database } from "@/database.types";
import { server } from "@/tests/mocks/node";
import { TSQWrapper, user } from "@/tests/vitest/setup";
import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse, type PathParams } from "msw";
import { describe, expect, it, vi } from "vitest";

type PurchasesRow = Database["public"]["Tables"]["purchases"]["Row"];

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

	it("まとめて精算ボタンで複数IDのPATCH APIが正しいボディで呼ばれる", async () => {
		const patchSpy = vi.fn();
		let calledUrl = "";
		server.use(
			http.patch<PathParams, { is_settled: boolean }, PurchasesRow[]>(
				"*/rest/v1/purchases*",
				async ({ request }) => {
					const body = await request.json();
					patchSpy(body);
					calledUrl = request.url;
					return HttpResponse.json([]);
				},
			),
		);
		render(<ClientUnsettledBlock initialPurchases={initialPurchases} />, {
			wrapper: TSQWrapper,
		});
		// 2つの購入品を選択
		const checkboxes = screen.getAllByRole("checkbox");
		await user.click(checkboxes[1]);
		await user.click(checkboxes[2]);
		const button = screen.getByRole("button", { name: "まとめて精算" });
		await user.click(button);
		await waitFor(() => {
			expect(patchSpy).toHaveBeenCalledWith({ is_settled: true });
			const params = new URL(calledUrl).searchParams;
			// id=in.() 形式で2つのidが含まれていることを検証
			const idParam = params.get("id");
			expect(idParam).toMatch(/in\.(\([^)]+\))/);
			const ids = idParam?.match(/in\.\(([^)]+)\)/)?.[1].split(",");
			expect(ids).toEqual(["1", "2"]);
		});
	});
});
