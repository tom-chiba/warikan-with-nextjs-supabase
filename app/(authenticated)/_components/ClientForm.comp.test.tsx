import ClientForm from "@/app/(authenticated)/_components/ClientForm";
import type { Database } from "@/database.types";
import { server } from "@/tests/mocks/node";
import { TSQWrapper, user } from "@/tests/vitest/setup";
import { render, screen, waitFor } from "@testing-library/react";
import { format } from "date-fns";
import { http, HttpResponse, type PathParams } from "msw";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

type PurchasersPurchasesInsert =
	Database["public"]["Tables"]["purchasers_purchases"]["Insert"];
type PurchasesInsert = Database["public"]["Tables"]["purchases"]["Insert"];
type PurchasesRow = Database["public"]["Tables"]["purchases"]["Row"];

const initialPurchasers: ComponentProps<
	typeof ClientForm
>["initialPurchasers"] = [
	{ id: 1, name: "テストユーザー1" },
	{ id: 2, name: "テストユーザー2" },
];

describe("ClientForm", () => {
	it("フォームが正しく表示される", () => {
		render(<ClientForm initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});

		expect(screen.getByLabelText("購入品名")).toBeInTheDocument();
		expect(screen.getByLabelText("購入日")).toBeInTheDocument();
		expect(screen.getAllByLabelText(/テストユーザー/)).toHaveLength(4);
		expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();
	});

	it("購入品名が未入力の場合バリデーションエラーが表示される", async () => {
		render(<ClientForm initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});

		// 金額欄には有効な値を入れる
		const amountInputs = screen.getAllByLabelText("テストユーザー1");
		await user.clear(amountInputs[0]);
		await user.type(amountInputs[0], "1000");

		// 購入品名は空のまま送信
		await user.click(screen.getByRole("button", { name: "追加" }));

		expect(await screen.findByText("必須")).toBeInTheDocument();
	});

	it("支払額欄に不正な値を入力すると '数字を入力してください' エラーが表示される", async () => {
		render(<ClientForm initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});

		const amountInputs = screen.getAllByLabelText("テストユーザー1");
		await user.clear(amountInputs[0]);
		await user.type(amountInputs[0], "abc");

		await user.click(screen.getByRole("button", { name: "追加" }));

		expect(
			await screen.findByText("数字を入力してください"),
		).toBeInTheDocument();
	});

	it("有効な値を入力して送信するとAPIリクエストが正しく送信され、ボディも正しい", async () => {
		const postRequestSpy = vi.fn();
		const purchasePostSpy = vi.fn();
		server.use(
			http.post<PathParams, PurchasersPurchasesInsert[], null>(
				"*/rest/v1/purchasers_purchases",
				async ({ request }) => {
					const body = await request.json();
					postRequestSpy(body);
					return new HttpResponse(null, { status: 201 });
				},
			),
			http.post<PathParams, PurchasesInsert, PurchasesRow[]>(
				"*/rest/v1/purchases",
				async ({ request }) => {
					const body = await request.json();
					purchasePostSpy(body);
					return HttpResponse.json([
						{
							id: 999,
							created_at: new Date().toISOString(),
							is_settled: false,
							note: body.note ?? "",
							purchase_date: body.purchase_date ?? null,
							title: body.title,
							user_id: body.user_id ?? "",
						},
					]);
				},
			),
		);
		render(<ClientForm initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});

		const purchaseNameInput = screen.getByLabelText("購入品名");
		// テストユーザー1,2の支払額欄を取得
		const amountInputs1 = screen.getAllByLabelText("テストユーザー1");
		const amountInputs2 = screen.getAllByLabelText("テストユーザー2");
		// 1人目に1000円、2人目に0円を入力
		await user.clear(amountInputs1[0]);
		await user.type(amountInputs1[0], "1000");
		await user.clear(amountInputs2[0]);
		await user.type(amountInputs2[0], "0");

		// 割勘金額も同様に1人目1000円、2人目0円にする
		const toPayInputs1 = screen.getAllByLabelText("テストユーザー1");
		const toPayInputs2 = screen.getAllByLabelText("テストユーザー2");
		await user.clear(toPayInputs1[1]);
		await user.type(toPayInputs1[1], "1000");
		await user.clear(toPayInputs2[1]);
		await user.type(toPayInputs2[1], "0");

		const submitButton = screen.getByRole("button", { name: "追加" });
		await user.type(purchaseNameInput, "テスト購入品");
		await user.click(submitButton);

		await waitFor(() => {
			expect(postRequestSpy).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.objectContaining({
						purchaser_id: 1,
						amount_paid: 1000,
						amount_to_pay: 1000,
					}),
					expect.objectContaining({
						purchaser_id: 2,
						amount_paid: 0,
						amount_to_pay: 0,
					}),
				]),
			);
			expect(purchasePostSpy).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.objectContaining({ title: "テスト購入品" }),
				]),
			);
		});
	});

	it("メモ・購入日を入力した場合にAPIリクエストボディに含まれる", async () => {
		const purchasePostSpy = vi.fn();
		const purchasersPurchasesPostSpy = vi.fn();
		server.use(
			http.post<PathParams, PurchasesInsert, PurchasesRow[]>(
				"*/rest/v1/purchases",
				async ({ request }) => {
					const body = await request.json();
					purchasePostSpy(body);
					return HttpResponse.json([
						{
							id: 999,
							created_at: new Date().toISOString(),
							is_settled: false,
							note: body.note ?? "",
							purchase_date: body.purchase_date ?? null,
							title: body.title,
							user_id: body.user_id ?? "",
						},
					]);
				},
			),
			http.post<PathParams, PurchasersPurchasesInsert[], null>(
				"*/rest/v1/purchasers_purchases",
				async ({ request }) => {
					const body = await request.json();
					purchasersPurchasesPostSpy(body);
					return new HttpResponse(null, { status: 201 });
				},
			),
		);
		render(<ClientForm initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});

		await user.type(screen.getByLabelText("購入品名"), "オプションテスト");
		await user.type(screen.getByLabelText("メモ"), "メモ内容");
		const dateButton = screen.getByRole("button", { name: "購入日" });
		await user.click(dateButton);

		// 金額欄すべてに有効な値を入力（支払額・割勘金額の合計が一致するように）
		const amountInputs1 = screen.getAllByLabelText("テストユーザー1");
		const amountInputs2 = screen.getAllByLabelText("テストユーザー2");
		await user.click(amountInputs1[0]);
		await user.type(amountInputs1[0], "{selectall}{backspace}100");
		await user.click(amountInputs2[0]);
		await user.type(amountInputs2[0], "{selectall}{backspace}200");
		await user.click(amountInputs1[1]);
		await user.type(amountInputs1[1], "{selectall}{backspace}150");
		await user.click(amountInputs2[1]);
		await user.type(amountInputs2[1], "{selectall}{backspace}150");

		await user.click(screen.getByRole("button", { name: "追加" }));

		await waitFor(() => {
			expect(purchasePostSpy).toHaveBeenCalledWith([
				{
					title: "オプションテスト",
					note: "メモ内容",
					purchase_date: format(new Date(), "yyyy-MM-dd"),
				},
			]);
		});
	});

	it("等分スイッチOFF時に手動で割勘金額を入力した場合のAPIリクエストが正しい", async () => {
		const postRequestSpy = vi.fn();
		const purchasePostSpy = vi.fn();
		server.use(
			http.post<PathParams, PurchasersPurchasesInsert[], null>(
				"*/rest/v1/purchasers_purchases",
				async ({ request }) => {
					const body = await request.json();
					postRequestSpy(body);
					return new HttpResponse(null, { status: 201 });
				},
			),
			http.post<PathParams, PurchasesInsert, PurchasesRow[]>(
				"*/rest/v1/purchases",
				async ({ request }) => {
					const body = await request.json();
					purchasePostSpy(body);
					return HttpResponse.json([
						{
							id: 999,
							created_at: new Date().toISOString(),
							is_settled: false,
							note: body.note ?? "",
							purchase_date: body.purchase_date ?? null,
							title: body.title,
							user_id: body.user_id ?? "",
						},
					]);
				},
			),
		);
		render(<ClientForm initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});

		await user.type(screen.getByLabelText("購入品名"), "分岐テスト");
		const amountInputs1 = screen.getAllByLabelText("テストユーザー1");
		const amountInputs2 = screen.getAllByLabelText("テストユーザー2");
		await user.click(amountInputs1[0]);
		await user.type(amountInputs1[0], "{selectall}{backspace}100");
		await user.click(amountInputs2[0]);
		await user.type(amountInputs2[0], "{selectall}{backspace}200");

		const switchInput = screen.getByRole("switch", { name: "等分" });
		await user.click(switchInput);

		await user.click(amountInputs1[1]);
		await user.type(amountInputs1[1], "{selectall}{backspace}150");
		await user.click(amountInputs2[1]);
		await user.type(amountInputs2[1], "{selectall}{backspace}150");

		await user.click(screen.getByRole("button", { name: "追加" }));

		await waitFor(() => {
			expect(postRequestSpy).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.objectContaining({
						purchaser_id: 1,
						amount_paid: 100,
						amount_to_pay: 150,
					}),
					expect.objectContaining({
						purchaser_id: 2,
						amount_paid: 200,
						amount_to_pay: 150,
					}),
				]),
			);
		});
	});
});
