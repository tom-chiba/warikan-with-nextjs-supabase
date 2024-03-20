import Link from "next/link";
import { Form, Table } from "./_components";

export default function People() {
	return (
		<div>
			<h1>People Page</h1>
			<Link href="/">トップページへ</Link>
			<Form />
			<Table />
		</div>
	);
}
