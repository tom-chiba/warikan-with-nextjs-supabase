import ClientPurchasersTable from "@/app/(authenticated)/member/_components/ClientPurchasersTable";
import { TSQWrapper, user } from "@/tests/vitest/setup";
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
	});

	test("mutation後にmock handlerのデータが表示されるべき", async () => {
		render(<ClientPurchasersTable initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});

		expect(screen.getByText("Alice")).toBeInTheDocument();
		expect(screen.getByText("Bob")).toBeInTheDocument();
		expect(screen.queryByText("John")).not.toBeInTheDocument();
		expect(screen.queryByText("Jane")).not.toBeInTheDocument();

		await user.click(screen.getByText("追加"));
		await user.type(screen.getByRole("textbox"), "Charlie");
		await user.click(screen.getByRole("button", { name: /Save/i }));

		expect(await screen.findByText("John")).toBeInTheDocument();
		expect(await screen.findByText("Jane")).toBeInTheDocument();

		expect(screen.queryByText("Alice")).not.toBeInTheDocument();
		expect(screen.queryByText("Bob")).not.toBeInTheDocument();
	});
});
