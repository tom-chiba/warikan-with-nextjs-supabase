import Link from "next/link";
import { Form } from "./_components";

export default function Group() {
  return (
    <div>
      <h1>Group Page</h1>
      <Link href="/">トップページへ</Link>
      <Form />
    </div>
  );
}
