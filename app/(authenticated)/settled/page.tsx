import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ServerSettledTable } from "./serverComponents";

export default function Settled() {
	return (
		<Tabs defaultValue="settled">
			<TabsList>
				<TabsTrigger value="purchaseForm" asChild>
					<Link href="/">入力</Link>
				</TabsTrigger>
				<TabsTrigger value="unsettled">
					<Link href="/unsettled">未精算リスト</Link>
				</TabsTrigger>
				<TabsTrigger value="settled" asChild>
					<Link href="/settled">精算済リスト</Link>
				</TabsTrigger>
			</TabsList>
			<TabsContent value="settled">
				<ServerSettledTable />
			</TabsContent>
		</Tabs>
	);
}
