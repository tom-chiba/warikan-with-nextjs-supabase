import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ServerUnsettledBlock } from "./serverComponents";

export default function Unsettled() {
	return (
		<Tabs defaultValue="unsettled" className="w-[400px]">
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
			<TabsContent value="unsettled">
				<ServerUnsettledBlock />
			</TabsContent>
		</Tabs>
	);
}
