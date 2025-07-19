"use client";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html lang="ja">
			<body>
				<h2>Something went wrong!</h2>
				<details>
					<summary>Details</summary>
					<ul>
						<li>{error.digest}</li>
						<li>{error.message}</li>
					</ul>
				</details>
				<button type="button" onClick={() => reset()}>
					Try again
				</button>
			</body>
		</html>
	);
}
