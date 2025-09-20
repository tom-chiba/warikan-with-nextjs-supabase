import ErrorMessage from "@/components/ErrorMessage";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe("ErrorMessage", () => {
	test("デフォルトのメッセージが表示されるべき", () => {
		render(<ErrorMessage />);
		expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
	});

	test("指定されたメッセージが表示されるべき", () => {
		const message = "テストエラーメッセージ";
		render(<ErrorMessage message={message} />);
		expect(screen.getByText(message)).toBeInTheDocument();
	});
});
