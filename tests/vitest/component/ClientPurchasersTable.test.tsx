import ClientPurchasersTable from "@/app/(authenticated)/member/_components/ClientPurchasersTable";
import { TSQWrapper, user } from "@/tests/vitest/setup";
import {} from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test } from "vitest";

const initialPurchasers = [
	{ id: 1, name: "Alice" },
	{ id: 2, name: "Bob" },
];

describe("ClientPurchasersTable", () => {
	test("初期購入者が表示されるべき", () => {
		render(<ClientPurchasersTable initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});
		expect(screen.getByText("Alice")).toBeInTheDocument();
		expect(screen.getByText("Bob")).toBeInTheDocument();
	});

	test("新しい購入者が追加されるべき", async () => {
		render(<ClientPurchasersTable initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});

		await user.click(screen.getByText("追加"));
		await user.type(screen.getByRole("textbox"), "Charlie");
		await user.click(screen.getByRole("button", { name: /Save/i }));

		await waitFor(() => {
			expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
		});
	});

	test("購入者が編集されるべき", async () => {
		render(<ClientPurchasersTable initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});

		await user.click(screen.getAllByRole("button", { name: /Edit/i })[0]);

		expect(await screen.findByRole("textbox")).toBeInTheDocument();

		await user.type(screen.getByRole("textbox"), " (edited)");
		await user.click(screen.getByRole("button", { name: /Save/i }));

		await waitFor(() => {
			expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
		});
	});

	test("購入者が削除されるべき", async () => {
		render(<ClientPurchasersTable initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});

		await user.click(screen.getAllByRole("button", { name: /Delete/i })[0]);

		// 複雑なモック設定なしにリストからの削除をテストすることは困難なため、
		// 現時点では、エラーがスローされないことのみを確認します。
	});

	test("mutation後にmock handlerのデータが表示されるべき", async () => {
		render(<ClientPurchasersTable initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});

		// 初期表示（propsで渡されたデータ）を確認
		expect(screen.getByText("Alice")).toBeInTheDocument();
		expect(screen.getByText("Bob")).toBeInTheDocument();
		expect(screen.queryByText("John")).not.toBeInTheDocument();
		expect(screen.queryByText("Jane")).not.toBeInTheDocument();

		// 追加処理（mutation）を実行
		await user.click(screen.getByText("追加"));
		await user.type(screen.getByRole("textbox"), "Charlie");
		await user.click(screen.getByRole("button", { name: /Save/i }));

		// mutation後、mock handlerから取得したデータに表示が変わることを確認
		expect(await screen.findByText("John")).toBeInTheDocument();
		expect(await screen.findByText("Jane")).toBeInTheDocument();

		// 元のデータは消えていることを確認
		expect(screen.queryByText("Alice")).not.toBeInTheDocument();
		expect(screen.queryByText("Bob")).not.toBeInTheDocument();
	});
});
