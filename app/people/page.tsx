import Link from "next/link";
import { Form, Table } from "./_clientComponents";

export default function People() {
	return (
		<div>
			<h1>購入者ページ</h1>
			<Link href="/">トップページへ</Link>
			<Form />
			<Table />
		</div>
	);
}
