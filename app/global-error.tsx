"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
				<div className="flex min-h-screen items-center justify-center p-4">
					<div className="w-full max-w-md space-y-6 text-center">
						<div className="flex justify-center">
							<AlertCircle className="h-12 w-12 text-destructive" />
						</div>
						<div className="space-y-2">
							<h2 className="text-2xl font-bold tracking-tight">
								エラーが発生しました
							</h2>
							<p className="text-sm text-muted-foreground">{error.message}</p>
						</div>
						<Button onClick={() => reset()} className="w-full">
							再試行
						</Button>
					</div>
				</div>
			</body>
		</html>
	);
}
