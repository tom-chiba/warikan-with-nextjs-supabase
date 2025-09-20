import NodataMessage from "@/components/NodataMessage";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe("NodataMessage", () => {
	test("データなしメッセージが表示されるべき", () => {
		render(<NodataMessage />);
		expect(screen.getByText("データがありません")).toBeInTheDocument();
	});
});
