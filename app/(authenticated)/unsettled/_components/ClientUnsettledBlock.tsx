"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { createClient } from "@/utils/supabase/client";
import ClientUnsettledTable from "./ClientUnsettledTable";

type ClientUnsettledBlockProps = {
	initialPurchases: {
		id: number;
		title: string;
		purchase_date: string | null;
		note: string;
		is_settled: boolean;
		purchasers_purchases: {
			id: number;
			purchaser_id: number;
			amount_paid: number | null;
			amount_to_pay: number | null;
		}[];
	}[];
};
const ClientUnsettledBlock = ({
	initialPurchases,
}: ClientUnsettledBlockProps) => {
	const supabase = createClient();
	const queryClient = useQueryClient();

	const [selectedPurchaseIds, setSelectedPurchaseIds] = useState<number[]>([]);

	const purchasersCache = useQuery({
		queryKey: ["purchasers"],
		queryFn: async () => {
			const { data: purchasers, error } = await supabase
				.from("purchasers")
				.select("id, name")
				.order("created_at", { ascending: true });
			if (error) throw new Error(error.message);

			return purchasers;
		},
	});

	const purchasesCache = useQuery({
		queryKey: ["purchases", "unsettled"],
		queryFn: async () => {
			const { data: purchasesData, error: purchasesError } = await supabase
				.from("purchases")
				.select(
					`
					id,
					title,
					purchase_date,
					is_settled,
					purchasers_purchases (id, purchaser_id, amount_paid, amount_to_pay )
				`,
				)
				.eq("is_settled", false)
				.order("purchase_date", { ascending: false });
			if (purchasesError) throw new Error(purchasesError.message);

			return purchasesData;
		},
		initialData: initialPurchases,
	});

	const settlePurchasesMutation = useMutation({
		mutationFn: async (purchaseIds: number[]) => {
			const { error } = await supabase
				.from("purchases")
				.update({ is_settled: true })
				.in("id", purchaseIds)
				.select();
			if (error) throw new Error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["purchases"] });
		},
		onError: () => {
			toast.error("精算処理に失敗しました");
		},
	});

	return (
		<>
			<Card className="w-[350px]">
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>払う人</TableHead>
								<TableHead>額(円)</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{purchasersCache.data?.map((purchaser) => (
								<TableRow key={purchaser.id}>
									<TableCell className="font-medium">
										{purchaser.name}
									</TableCell>
									<TableCell>
										{purchasesCache.data?.reduce((previous, current) => {
											if (!selectedPurchaseIds.includes(current.id))
												return previous;
											return (
												previous +
												(current.purchasers_purchases.find(
													(x) => x.purchaser_id === purchaser.id,
												)?.amount_to_pay ?? 0) -
												(current.purchasers_purchases.find(
													(x) => x.purchaser_id === purchaser.id,
												)?.amount_paid ?? 0)
											);
										}, 0)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
				<CardFooter className="flex justify-between">
					<Button
						onClick={() => settlePurchasesMutation.mutate(selectedPurchaseIds)}
						disabled={
							!selectedPurchaseIds.length || settlePurchasesMutation.isPending
						}
					>
						{settlePurchasesMutation.isPending ? "精算中..." : "まとめて精算"}
					</Button>
				</CardFooter>
			</Card>

			<ClientUnsettledTable
				selectedPurchaseIds={selectedPurchaseIds}
				onSelectPurchases={(newSelectedPurchaseIds) =>
					setSelectedPurchaseIds(newSelectedPurchaseIds)
				}
				initialPurchases={initialPurchases}
			/>
		</>
	);
};
export default ClientUnsettledBlock;
