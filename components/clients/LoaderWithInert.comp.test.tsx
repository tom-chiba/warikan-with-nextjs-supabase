import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LoaderWithInert from "@/components/clients/LoaderWithInert";

describe("LoaderWithInert", () => {
	it("Loaderコンポーネントを表示する", () => {
		render(<LoaderWithInert />);
		expect(screen.getByLabelText("読み込み中")).toBeInTheDocument();
	});

	it("マウント時にdocument.bodyにinert属性が設定される", () => {
		render(<LoaderWithInert />);
		expect(document.body).toHaveAttribute("inert");
	});

	it("アンマウント時にinert属性が削除される", () => {
		const { unmount } = render(<LoaderWithInert />);
		expect(document.body).toHaveAttribute("inert");
		unmount();
		expect(document.body).not.toHaveAttribute("inert");
	});
});
