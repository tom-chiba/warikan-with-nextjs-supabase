import Link from "next/link";

export default function Index() {
	return (
		<div>
			<h1>Top Page</h1>
			<div>
				<Link href="/people">購入者ページへ</Link>
			</div>
			<div>
				<Link href="/purchase-form">購入品入力ページへ</Link>
			</div>
			<div>
				<Link href="/unsettled">未精算リストページへ</Link>
			</div>
			<div>
				<Link href="/settled">精算済リストページへ</Link>
			</div>
		</div>
	);
}
