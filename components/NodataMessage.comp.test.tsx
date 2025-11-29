import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NodataMessage from "@/components/NodataMessage";

describe("NodataMessage", () => {
	it("データなしメッセージが表示されるべき", () => {
		render(<NodataMessage />);
		expect(screen.getByText("データがありません")).toBeInTheDocument();
	});
});
