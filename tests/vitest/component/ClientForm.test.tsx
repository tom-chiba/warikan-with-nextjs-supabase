import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { user } from "../setup";

import ClientForm from "@/app/(authenticated)/_components/ClientForm";
import type { ComponentProps } from "react";
import { TSQWrapper } from "../setup";

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

	it("有効な値を入力して送信するとフォームがリセットされる", async () => {
		render(<ClientForm initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});

		const purchaseNameInput = screen.getByLabelText("購入品名");
		const amountInputs = screen.getAllByLabelText("テストユーザー1");
		const amountInputForPaid = amountInputs[0];
		const submitButton = screen.getByRole("button", { name: "追加" });

		await user.type(purchaseNameInput, "テスト購入品");
		await user.type(amountInputForPaid, "1000");

		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByLabelText("購入品名")).toHaveValue("");
			expect(screen.getAllByLabelText("テストユーザー1")[0]).toHaveValue("0");
		});
	});
});
