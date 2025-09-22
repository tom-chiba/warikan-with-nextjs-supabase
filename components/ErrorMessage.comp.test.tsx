import ErrorMessage from "@/components/ErrorMessage";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("ErrorMessage", () => {
	it("デフォルトのメッセージが表示されるべき", () => {
		render(<ErrorMessage />);
		expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
	});

	it("指定されたメッセージが表示されるべき", () => {
		const message = "テストエラーメッセージ";
		render(<ErrorMessage message={message} />);
		expect(screen.getByText(message)).toBeInTheDocument();
	});
});
