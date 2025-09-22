import NodataMessage from "@/components/NodataMessage";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("NodataMessage", () => {
	it("データなしメッセージが表示されるべき", () => {
		render(<NodataMessage />);
		expect(screen.getByText("データがありません")).toBeInTheDocument();
	});
});
