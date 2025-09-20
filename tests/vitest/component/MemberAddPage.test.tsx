import ClientPurchasersTable from "@/app/(authenticated)/member/_components/ClientPurchasersTable";
import { TSQWrapper, user } from "@/tests/vitest/setup";
import { render, screen, waitFor } from "@testing-library/react";

const initialPurchasers = [
	{ id: 1, name: "山田太郎" },
	{ id: 2, name: "佐藤花子" },
];

describe("ClientPurchasersTable (メンバー追加ページ)", () => {
	it("初期表示でメンバー一覧が表示される", () => {
		render(<ClientPurchasersTable initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});
		expect(screen.getByText("山田太郎")).toBeInTheDocument();
		expect(screen.getByText("佐藤花子")).toBeInTheDocument();
		expect(screen.getByText("追加")).toBeInTheDocument();
	});

	it("追加ボタンを押すと入力欄が表示される", async () => {
		render(<ClientPurchasersTable initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});
		await user.click(screen.getByText("追加"));
		expect(screen.getByRole("textbox")).toBeInTheDocument();
	});

	it("名前を入力して保存ボタンを押すと追加処理が呼ばれる", async () => {
		render(<ClientPurchasersTable initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});
		await user.click(screen.getByText("追加"));
		const input = screen.getByRole("textbox");
		await user.type(input, "新メンバー");
		const saveButton = screen.getByLabelText("Save");
		await user.click(saveButton);
		await waitFor(() => {
			expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
		});
	});

	it("編集ボタンで名前編集ができる", async () => {
		render(<ClientPurchasersTable initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});
		const editButtons = screen.getAllByLabelText("Edit");
		await user.click(editButtons[0]);
		expect(screen.getByRole("textbox")).toHaveValue("山田太郎");
	});

	it("削除ボタンで削除処理が呼ばれる", async () => {
		render(<ClientPurchasersTable initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});
		const deleteButtons = screen.getAllByLabelText("Delete");
		await user.click(deleteButtons[0]);
		// 削除後のUI変化をテストする場合はここに記述
	});

	it("mutation後にmock handlerのデータが表示されるべき", async () => {
		render(<ClientPurchasersTable initialPurchasers={initialPurchasers} />, {
			wrapper: TSQWrapper,
		});
		expect(screen.getByText("山田太郎")).toBeInTheDocument();
		expect(screen.getByText("佐藤花子")).toBeInTheDocument();
		expect(screen.queryByText("John")).not.toBeInTheDocument();
		expect(screen.queryByText("Jane")).not.toBeInTheDocument();
		await user.click(screen.getByText("追加"));
		await user.type(screen.getByRole("textbox"), "新メンバー");
		await user.click(screen.getByLabelText("Save"));
		expect(await screen.findByText("John")).toBeInTheDocument();
		expect(await screen.findByText("Jane")).toBeInTheDocument();
		expect(screen.queryByText("山田太郎")).not.toBeInTheDocument();
		expect(screen.queryByText("佐藤花子")).not.toBeInTheDocument();
	});
});
