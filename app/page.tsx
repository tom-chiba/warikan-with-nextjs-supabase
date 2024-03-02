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
    </div>
  );
}
