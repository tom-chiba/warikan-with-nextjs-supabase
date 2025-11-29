import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ServerForm from "./_components/ServerForm";

export default function Index() {
	return (
		<Tabs defaultValue="purchaseForm">
			<TabsList>
				<TabsTrigger value="purchaseForm" asChild>
					<Link href="/">入力</Link>
				</TabsTrigger>
				<TabsTrigger value="unsettled" asChild>
					<Link href="/unsettled">未精算</Link>
				</TabsTrigger>
				<TabsTrigger value="settled" asChild>
					<Link href="/settled">精算済</Link>
				</TabsTrigger>
				<TabsTrigger value="member" asChild>
					<Link href="/member">メンバー</Link>
				</TabsTrigger>
			</TabsList>
			<TabsContent value="purchaseForm">
				<ServerForm />
			</TabsContent>
		</Tabs>
	);
}
