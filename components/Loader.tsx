import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoaderProps = {
	className?: string;
};

/**
 * ローディングスピナーコンポーネント（Server Component対応）
 *
 * @description
 * データフェッチ中やページ遷移時に表示するローディング表示。
 * 全画面オーバーレイで表示されるが、ユーザーの操作はブロックしない。
 *
 * @usage
 * - useQueryのisLoading時の条件分岐
 * - Next.js loading.tsxでの使用（inertが不要な場合）
 *
 * @see LoaderWithInert - 操作ブロックが必要な場合はこちらを使用
 */
const Loader = ({ className }: LoaderProps) => {
	return (
		<div
			role="status"
			aria-label="読み込み中"
			className={cn(
				"fixed top-0 left-0 flex justify-center items-center w-full h-full bg-white/50 dark:bg-black/50",
				className,
			)}
		>
			<Loader2 className="h-12 w-12 animate-spin text-primary" />
		</div>
	);
};

export default Loader;
