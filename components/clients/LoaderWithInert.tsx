"use client";

import { useEffect } from "react";
import Loader from "@/components/Loader";

/**
 * inert属性付きローディングコンポーネント（Client Component）
 *
 * @description
 * Loaderコンポーネントをラップし、表示中は全画面の操作をブロックする。
 * document.bodyにinert属性を付与することで、フォーカス移動やクリックを防止。
 *
 * @usage
 * - Next.js loading.tsxでのページ遷移中
 * - Server Actions実行中（useTransitionのisPending）
 * - 重要なMutation処理中（データ整合性が重要な場合）
 *
 * @warning
 * ユーザー操作を完全にブロックするため、長時間の表示は避けること
 */
const LoaderWithInert = () => {
	useEffect(() => {
		document.body.setAttribute("inert", "");
		return () => {
			document.body.removeAttribute("inert");
		};
	}, []);

	return <Loader />;
};

export default LoaderWithInert;
