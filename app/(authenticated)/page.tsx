import Link from "next/link";
import { Suspense } from "react";
import { TabList } from "./components";
import { ServerForm } from "./serverComponents";

export default function Index() {
	return (
		<div>
			<h1>購入品入力ページ</h1>
			<TabList
				tabItems={[
					{ label: "入力", href: "/purchase-form" },
					{ label: "未精算リスト", href: "/unsettled" },
					{ label: "精算済リスト", href: "/settled" },
				]}
			/>
			<ServerForm />
		</div>
	);
}
