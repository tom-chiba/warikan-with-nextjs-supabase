import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import ServerSettledTable from "./_components/ServerSettledTable";

export default function Settled() {
	return (
		<Tabs defaultValue="settled">
			<TabsList>
				<TabsTrigger value="purchaseForm" asChild>
					<Link href="/">入力</Link>
				</TabsTrigger>
				<TabsTrigger value="unsettled">
					<Link href="/unsettled">未精算</Link>
				</TabsTrigger>
				<TabsTrigger value="settled" asChild>
					<Link href="/settled">精算済</Link>
				</TabsTrigger>
				<TabsTrigger value="member" asChild>
					<Link href="/member">メンバー</Link>
				</TabsTrigger>
			</TabsList>
			<TabsContent value="settled">
				<ServerSettledTable />
			</TabsContent>
		</Tabs>
	);
}
