import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export type ErrorMessageProps = {
	title?: string;
	message?: string;
	onRetry?: () => void;
};

const ErrorMessage = ({
	title,
	message = "エラーが発生しました",
	onRetry,
}: ErrorMessageProps) => (
	<div
		className="bg-red-700 text-white p-4 rounded-md my-4 text-center"
		role="alert"
		aria-live="assertive"
	>
		<div className="flex flex-col items-center gap-2">
			<AlertCircle className="h-5 w-5" />
			{title && <span className="font-bold block">{title}</span>}
			<span className="block">{message}</span>
			{onRetry && (
				<Button
					onClick={onRetry}
					variant="outline"
					size="sm"
					className="bg-white text-red-700 hover:bg-gray-100 mt-2"
				>
					再試行
				</Button>
			)}
		</div>
	</div>
);

export default ErrorMessage;
