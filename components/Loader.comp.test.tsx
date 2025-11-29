import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Loader from "@/components/Loader";

describe("Loader", () => {
	it("ローディングスピナーが表示される", () => {
		render(<Loader />);
		expect(screen.getByLabelText("読み込み中")).toBeInTheDocument();
	});

	it("適切なスタイルが適用されている", () => {
		render(<Loader />);
		const loader = screen.getByLabelText("読み込み中");
		expect(loader).toHaveClass("fixed", "top-0", "left-0");
	});

	it("className propsでカスタムスタイルを追加できる", () => {
		render(<Loader className="custom-class z-50" />);
		const loader = screen.getByLabelText("読み込み中");
		expect(loader).toHaveClass("custom-class", "z-50", "fixed");
	});
});
