import Link from "next/link";
import { Table } from "./_component";

export default function PurchaseForm() {
  return (
    <div>
      <h1>Unsettled Page</h1>
      <Link href="/">トップページへ</Link>
      <Table />
    </div>
  );
}
