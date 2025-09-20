export type ErrorMessageProps = {
	message?: string;
};

const ErrorMessage = ({
	message = "エラーが発生しました",
}: ErrorMessageProps) => (
	<div className="bg-red-700 text-white p-4 rounded-md my-4 text-center">
		{message}
	</div>
);

export default ErrorMessage;
