import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ErrorMessage from "./ErrorMessage";

describe("ErrorMessage", () => {
	describe("デフォルトメッセージの表示", () => {
		it("propsなしでデフォルトメッセージ「エラーが発生しました」が表示される", () => {
			render(<ErrorMessage />);

			// デフォルトメッセージが表示されることを確認
			expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
		});
	});

	describe("カスタムメッセージの表示", () => {
		it("messageプロップで指定したメッセージが表示される", () => {
			const customMessage = "カスタムエラーメッセージ";
			render(<ErrorMessage message={customMessage} />);

			// カスタムメッセージが表示されることを確認
			expect(screen.getByText(customMessage)).toBeInTheDocument();
		});

		it("空文字列のmessageプロップでも表示される", () => {
			render(<ErrorMessage message="" />);

			// 空文字列でもエラーにならないことを確認（要素は存在する）
			const errorContainer = screen.getByRole("alert", { hidden: true });
			expect(errorContainer).toBeInTheDocument();
		});
	});

	describe("タイトルの表示（新機能）", () => {
		it("titleプロップが渡された場合、タイトルが表示される", () => {
			const title = "エラータイトル";
			const message = "エラーの詳細メッセージ";

			render(<ErrorMessage title={title} message={message} />);

			// タイトルとメッセージの両方が表示されることを確認
			expect(screen.getByText(title)).toBeInTheDocument();
			expect(screen.getByText(message)).toBeInTheDocument();
		});

		it("titleのみが渡された場合、タイトルとデフォルトメッセージが表示される", () => {
			const title = "エラータイトル";

			render(<ErrorMessage title={title} />);

			// タイトルとデフォルトメッセージが表示されることを確認
			expect(screen.getByText(title)).toBeInTheDocument();
			expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
		});
	});

	describe("再試行ボタン（新機能）", () => {
		it("onRetryプロップが渡された場合、再試行ボタンが表示される", () => {
			const onRetry = vi.fn();

			render(<ErrorMessage message="エラーが発生しました" onRetry={onRetry} />);

			// 再試行ボタンが表示されることを確認
			const retryButton = screen.getByRole("button", { name: /再試行/i });
			expect(retryButton).toBeInTheDocument();
		});

		it("再試行ボタンをクリックするとonRetryが呼ばれる", async () => {
			const user = userEvent.setup();
			const onRetry = vi.fn();

			render(<ErrorMessage message="エラーが発生しました" onRetry={onRetry} />);

			const retryButton = screen.getByRole("button", { name: /再試行/i });
			await user.click(retryButton);

			// onRetryが1回呼ばれることを確認
			expect(onRetry).toHaveBeenCalledTimes(1);
		});

		it("onRetryプロップがない場合、再試行ボタンは表示されない", () => {
			render(<ErrorMessage message="エラーが発生しました" />);

			// 再試行ボタンが存在しないことを確認
			const retryButton = screen.queryByRole("button", { name: /再試行/i });
			expect(retryButton).not.toBeInTheDocument();
		});

		it("再試行ボタンが複数回クリック可能", async () => {
			const user = userEvent.setup();
			const onRetry = vi.fn();

			render(<ErrorMessage message="エラーが発生しました" onRetry={onRetry} />);

			const retryButton = screen.getByRole("button", { name: /再試行/i });

			// 3回クリック
			await user.click(retryButton);
			await user.click(retryButton);
			await user.click(retryButton);

			// onRetryが3回呼ばれることを確認
			expect(onRetry).toHaveBeenCalledTimes(3);
		});
	});

	describe("アイコンの表示（新機能）", () => {
		it("AlertCircleアイコンが表示される", () => {
			render(<ErrorMessage message="エラーが発生しました" />);

			// AlertCircleアイコンのSVG要素が存在することを確認
			// lucide-reactのアイコンはsvg要素として描画される
			const svgElements = screen
				.getByText("エラーが発生しました")
				.closest("div")
				?.querySelector("svg");

			expect(svgElements).toBeInTheDocument();
		});

		it("titleありの場合もアイコンが表示される", () => {
			render(<ErrorMessage title="エラー" message="詳細" />);

			// AlertCircleアイコンのSVG要素が存在することを確認
			const container = screen.getByText("エラー").closest("div");
			const svgElements = container?.querySelector("svg");

			expect(svgElements).toBeInTheDocument();
		});
	});

	describe("アクセシビリティ", () => {
		it("role=alertが設定されている", () => {
			render(<ErrorMessage message="エラーが発生しました" />);

			// role="alert"が設定されていることを確認（スクリーンリーダー対応）
			const alert = screen.getByRole("alert");
			expect(alert).toBeInTheDocument();
		});

		it("aria-liveがassertiveに設定されている", () => {
			render(<ErrorMessage message="エラーが発生しました" />);

			const alert = screen.getByRole("alert");
			expect(alert).toHaveAttribute("aria-live", "assertive");
		});
	});

	describe("統合テスト", () => {
		it("全ての機能が同時に動作する", async () => {
			const user = userEvent.setup();
			const onRetry = vi.fn();
			const title = "致命的なエラー";
			const message = "サーバーに接続できませんでした";

			render(
				<ErrorMessage title={title} message={message} onRetry={onRetry} />,
			);

			// タイトル、メッセージ、アイコン、再試行ボタンが全て表示される
			expect(screen.getByText(title)).toBeInTheDocument();
			expect(screen.getByText(message)).toBeInTheDocument();

			const container = screen.getByRole("alert");
			expect(container.querySelector("svg")).toBeInTheDocument();

			const retryButton = screen.getByRole("button", { name: /再試行/i });
			expect(retryButton).toBeInTheDocument();

			// 再試行ボタンが動作する
			await user.click(retryButton);
			expect(onRetry).toHaveBeenCalledTimes(1);

			// アクセシビリティ属性も設定されている
			expect(container).toHaveAttribute("aria-live", "assertive");
		});
	});
});
