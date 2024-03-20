import Link from "next/link";
import { Form } from "./_component";

export default function PurchaseForm() {
	return (
		<div>
			<h1>PurchaseForm Page</h1>
			<Link href="/">トップページへ</Link>
			<Form />
		</div>
	);
}
