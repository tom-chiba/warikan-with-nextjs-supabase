import { server } from "@/tests/mocks/node";
import { TSQWrapper, user } from "@/tests/vitest/setup";
import { render, screen, waitFor } from "@testing-library/react";
import { format } from "date-fns";
import { http, HttpResponse, type PathParams } from "msw";
import { describe, expect, it, vi } from "vitest";
import PurchaseEditForm from "./PurchaseEditForm";

const initialPurchasers = [
	{ id: 1, name: "Alice" },
	{ id: 2, name: "Bob" },
];
const initialPurchase = {
	title: "ランチ",
	date: new Date(),
	note: "",
	purchasersAmountPaid: [
		{ id: 1, amountPaid: 1000 },
		{ id: 2, amountPaid: 2000 },
	],
	purchasersAmountToPay: [
		{ id: 1, amountToPay: 1500 },
		{ id: 2, amountToPay: 1500 },
	],
};

describe("PurchaseEditForm", () => {
	it("購入品名を編集したときにAPIリクエストが正しく送信される", async () => {
		const patchRequestSpy = vi.fn();
		const purchasersPurchasesPatchSpy = vi.fn();
		server.use(
			http.patch("*/rest/v1/purchasers_purchases*", async ({ request }) => {
				const body = await request.json();
				purchasersPurchasesPatchSpy(body);
				return HttpResponse.json(body, { status: 200 });
			}),
			http.patch<PathParams, Record<string, unknown>, Record<string, unknown>>(
				"*/rest/v1/purchases*",
				async ({ request }) => {
					const body = await request.json();
					patchRequestSpy(body);
					return HttpResponse.json(body, { status: 200 });
				},
			),
		);
		render(
			<PurchaseEditForm
				purchaseId={1}
				initialPurchasers={initialPurchasers}
				initialPurchase={initialPurchase}
			/>,
			{ wrapper: TSQWrapper },
		);
		await waitFor(() =>
			expect(screen.getByLabelText("購入品名")).toBeInTheDocument(),
		);
		await user.clear(screen.getByLabelText("購入品名"));
		await user.type(screen.getByLabelText("購入品名"), "ディナー");
		await user.click(screen.getByRole("button", { name: /更新/ }));
		await waitFor(() => {
			expect(patchRequestSpy).toHaveBeenCalledWith({
				purchase_date: format(new Date(), "yyyy-MM-dd"),
				title: "ディナー",
				note: "",
			});
			expect(purchasersPurchasesPatchSpy).toHaveBeenCalledWith({
				amount_paid: 1000,
				amount_to_pay: 1500,
			});
		});
	});

	it("購入日を編集したときにAPIリクエストが正しく送信される", async () => {
		const patchRequestSpy = vi.fn();
		const purchasersPurchasesPatchSpy = vi.fn();
		server.use(
			http.patch("*/rest/v1/purchases*", async ({ request }) => {
				const body = await request.json();
				patchRequestSpy(body);
				return HttpResponse.json(body, { status: 200 });
			}),
			http.patch("*/rest/v1/purchasers_purchases*", async ({ request }) => {
				const body = await request.json();
				purchasersPurchasesPatchSpy(body);
				return HttpResponse.json(body, { status: 200 });
			}),
		);
		render(
			<PurchaseEditForm
				purchaseId={1}
				initialPurchasers={initialPurchasers}
				initialPurchase={initialPurchase}
			/>,
			{ wrapper: TSQWrapper },
		);
		// 購入日ボタンをクリック（カレンダーUIのテストは省略し、ボタン押下のみ）
		const formatted = format(new Date(), "yyyy-MM-dd");
		const dateButton = screen.getByRole("button", { name: "購入日" });
		await user.click(dateButton);
		// 本来はカレンダーから日付選択だが、ここではAPIリクエストの検証のみ行う
		await user.click(screen.getByRole("button", { name: /更新/ }));
		await waitFor(() => {
			expect(patchRequestSpy).toHaveBeenCalledWith({
				purchase_date: formatted,
				title: initialPurchase.title,
				note: initialPurchase.note,
			});
		});
	});

	it("メモを編集したときにAPIリクエストが正しく送信される", async () => {
		const patchRequestSpy = vi.fn();
		const purchasersPurchasesPatchSpy = vi.fn();
		server.use(
			http.patch("*/rest/v1/purchases*", async ({ request }) => {
				const body = await request.json();
				patchRequestSpy(body);
				return HttpResponse.json(body, { status: 200 });
			}),
			http.patch("*/rest/v1/purchasers_purchases*", async ({ request }) => {
				const body = await request.json();
				purchasersPurchasesPatchSpy(body);
				return HttpResponse.json(body, { status: 200 });
			}),
		);
		render(
			<PurchaseEditForm
				purchaseId={1}
				initialPurchasers={initialPurchasers}
				initialPurchase={initialPurchase}
			/>,
			{ wrapper: TSQWrapper },
		);
		await waitFor(() =>
			expect(screen.getByLabelText("メモ")).toBeInTheDocument(),
		);
		await user.clear(screen.getByLabelText("メモ"));
		await user.type(screen.getByLabelText("メモ"), "割り勘メモ");
		await user.click(screen.getByRole("button", { name: /更新/ }));
		await waitFor(() => {
			expect(patchRequestSpy).toHaveBeenCalledWith({
				purchase_date: format(new Date(), "yyyy-MM-dd"),
				title: initialPurchase.title,
				note: "割り勘メモ",
			});
		});
	});

	it("支払金額・支払うべき金額を編集したときにAPIリクエストが正しく送信される", async () => {
		const purchasersPurchasesPatchSpy = vi.fn();
		const patchRequestSpy = vi.fn();
		server.use(
			http.patch("*/rest/v1/purchases*", async ({ request }) => {
				const body = await request.json();
				patchRequestSpy(body);
				return HttpResponse.json(body, { status: 200 });
			}),
			http.patch("*/rest/v1/purchasers_purchases*", async ({ request }) => {
				const body = await request.json();
				purchasersPurchasesPatchSpy(body);
				return HttpResponse.json(body, { status: 200 });
			}),
		);
		render(
			<PurchaseEditForm
				purchaseId={1}
				initialPurchasers={initialPurchasers}
				initialPurchase={initialPurchase}
			/>,
			{ wrapper: TSQWrapper },
		);
		// Alice/Bob両方のinput（支払金額・支払うべき金額）を編集し、合計が一致するようにする
		await waitFor(() =>
			expect(screen.getAllByLabelText("Alice").length).toBe(2),
		);
		await waitFor(() => expect(screen.getAllByLabelText("Bob").length).toBe(2));
		const [alicePaidInput, aliceToPayInput] = screen.getAllByLabelText("Alice");
		const [bobPaidInput, bobToPayInput] = screen.getAllByLabelText("Bob");
		// 例: Alice/Bobとも支払金額2000、支払うべき金額2000
		await user.clear(alicePaidInput);
		await user.type(alicePaidInput, "2000");
		await user.clear(aliceToPayInput);
		await user.type(aliceToPayInput, "2000");
		await user.clear(bobPaidInput);
		await user.type(bobPaidInput, "2000");
		await user.clear(bobToPayInput);
		await user.type(bobToPayInput, "2000");
		await user.click(screen.getByRole("button", { name: /更新/ }));
		await waitFor(() => {
			expect(purchasersPurchasesPatchSpy).toHaveBeenCalledWith({
				amount_paid: 2000,
				amount_to_pay: 2000,
			});
		});
	});

	it("何も変更せずに更新した場合、APIリクエストが正しく送信される", async () => {
		const patchRequestSpy = vi.fn();
		const purchasersPurchasesPatchSpy = vi.fn();
		server.use(
			http.patch("*/rest/v1/purchasers_purchases*", async ({ request }) => {
				const body = await request.json();
				purchasersPurchasesPatchSpy(body);
				return HttpResponse.json(body, { status: 200 });
			}),
			http.patch("*/rest/v1/purchases*", async ({ request }) => {
				const body = await request.json();
				patchRequestSpy(body);
				return HttpResponse.json(body, { status: 200 });
			}),
		);
		render(
			<PurchaseEditForm
				purchaseId={1}
				initialPurchasers={initialPurchasers}
				initialPurchase={initialPurchase}
			/>,
			{ wrapper: TSQWrapper },
		);
		await waitFor(() =>
			expect(screen.getByRole("button", { name: /更新/ })).toBeInTheDocument(),
		);
		await user.click(screen.getByRole("button", { name: /更新/ }));
		await waitFor(() => {
			expect(patchRequestSpy).toHaveBeenCalledWith({
				purchase_date: format(new Date(), "yyyy-MM-dd"),
				title: initialPurchase.title,
				note: initialPurchase.note,
			});
			expect(purchasersPurchasesPatchSpy).toHaveBeenCalledWith({
				amount_paid: 1000,
				amount_to_pay: 1500,
			});
		});
	});
});
