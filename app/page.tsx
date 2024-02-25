import Link from "next/link";

export default function Index() {
  return (
    <div>
      <h1>Top Page</h1>
      <Link href="/people">購入者ページへ</Link>
    </div>
  );
}
