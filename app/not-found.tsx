import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center px-4">
			<div className="text-center">
				<FileQuestion className="mx-auto mb-6 h-16 w-16 text-muted-foreground" />
				<h1 className="mb-2 text-3xl font-bold">ページが見つかりません</h1>
				<p className="mb-8 text-muted-foreground">
					お探しのページは存在しないか、移動した可能性があります。
				</p>
				<Button asChild>
					<Link href="/">ホームに戻る</Link>
				</Button>
			</div>
		</div>
	);
}
