import Loader from "@/components/clients/Loader";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Loader", () => {
	it("isLoadingがtrueの場合、ローダーが表示され、bodyにinert属性が設定されるべき", () => {
		render(<Loader isLoading={true} />);
		expect(screen.getByLabelText("読み込み中")).toBeInTheDocument();
		expect(document.body).toHaveAttribute("inert");
	});

	it("isLoadingがfalseの場合、ローダーが表示されないべき", () => {
		render(<Loader isLoading={false} />);
		expect(screen.queryByLabelText("読み込み中")).not.toBeInTheDocument();
	});

	it("アンマウント時にbodyのinert属性が削除されるべき", () => {
		const { unmount } = render(<Loader isLoading={true} />);
		expect(document.body).toHaveAttribute("inert");
		unmount();
		expect(document.body).not.toHaveAttribute("inert");
	});
});
