import Link from "next/link";
import { Suspense } from "react";
import { ServerForm } from "./_serverComponents";

export default function PurchaseForm() {
	return (
		<div>
			<h1>PurchaseForm Page</h1>
			<Link href="/">トップページへ</Link>
			<Suspense fallback={<span>loading</span>}>
				<ServerForm />
			</Suspense>
		</div>
	);
}
