import Link from "next/link";
import { Suspense } from "react";
import { TabList } from "./_components";
import { ServerForm } from "./_serverComponents";

export default function PurchaseForm() {
	return (
		<div className="overflow-auto">
			<h1>PurchaseForm Page</h1>
			<Link href="/">トップページへ</Link>
			<TabList
				tabItems={[
					{ label: "入力", href: "/purchase-form" },
					{ label: "未精算リスト", href: "/unsettled" },
					{ label: "精算済リスト", href: "settled" },
				]}
			/>
			<Suspense fallback={<span>loading</span>}>
				<ServerForm />
			</Suspense>
		</div>
	);
}
