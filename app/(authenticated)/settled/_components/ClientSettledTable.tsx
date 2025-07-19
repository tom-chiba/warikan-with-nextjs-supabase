"use client";

import ErrorMessage from "@/components/ErrorMessage";
import NodataMessage from "@/components/NodataMessage";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { createClient } from "@/utils/supabase/client";
import type { UseQueryDataAndStatus } from "@/utils/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import ClientControlMenu from "./ClientControlMenu";

type ClientSettledTableProps = {
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
	initialPurchasers: {
		id: number;
		name: string;
	}[];
};
const ClientSettledTable = ({
	initialPurchases,
	initialPurchasers,
}: ClientSettledTableProps) => {
	const supabase = createClient();
	const queryClient = useQueryClient();

	const purchasesCache = useQuery({
		queryKey: ["purchases", "settled"],
		queryFn: async () => {
			const { data: purchasesData, error: purchasesError } = await supabase
				.from("purchases")
				.select(
					`
					id,
					title,
					purchase_date,
					note,
					is_settled,
					purchasers_purchases ( id, purchaser_id, amount_paid, amount_to_pay )
				`,
				)
				.eq("is_settled", true)
				.order("purchase_date", { ascending: false });
			if (purchasesError) throw new Error(purchasesError.message);

			return purchasesData;
		},
		initialData: initialPurchases,
	});

	const purchaseTableData: UseQueryDataAndStatus<
		{
			id: number;
			title: string;
			date: string | undefined;
			note: string;
			purchasers: {
				id: number;
				purchaser_id: number;
				amount_paid: number | null;
				amount_to_pay: number | null;
			}[];
			totalAmount: number;
		}[]
	> =
		purchasesCache.status === "error"
			? { status: "error", data: undefined, isRefetching: false }
			: {
					status: "success",
					data: purchasesCache.data.map((x) => ({
						id: x.id,
						title: x.title,
						date: x.purchase_date ?? undefined,
						note: x.note,
						purchasers: x.purchasers_purchases,
						totalAmount: x.purchasers_purchases.reduce(
							(previous, current) => previous + (current.amount_paid ?? 0),
							0,
						),
					})),
					isRefetching: false,
				};

	const deletePurchaseMutation = useMutation({
		mutationFn: async (purchaseId: number) => {
			const { error } = await supabase
				.from("purchases")
				.delete()
				.eq("id", purchaseId);
			if (error) throw new Error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["purchases"] });
		},
	});

	const unsettlePurchaseMutation = useMutation({
		mutationFn: async (purchaseId: number) => {
			const { error } = await supabase
				.from("purchases")
				.update({ is_settled: false })
				.eq("id", purchaseId)
				.select();
			if (error) throw new Error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["purchases"] });
		},
	});

	useEffect(() => {
		queryClient.invalidateQueries({ queryKey: ["purchases", "settled"] });
	}, [queryClient]);

	return (
		<>
			{purchaseTableData.status === "error" ||
			deletePurchaseMutation.status === "error" ||
			unsettlePurchaseMutation.status === "error" ? (
				<ErrorMessage />
			) : purchaseTableData.data.length === 0 ? (
				<NodataMessage />
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>購入品名</TableHead>
							<TableHead>購入日</TableHead>
							<TableHead>合計金額(円)</TableHead>
							<TableHead className="w-[20px]" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{purchaseTableData.data.map((purchase) => (
							<TableRow key={purchase.id}>
								<TableCell>{purchase.title}</TableCell>
								<TableCell>{purchase.date}</TableCell>
								<TableCell>{purchase.totalAmount}</TableCell>
								<TableCell>
									<ClientControlMenu purchaseId={purchase.id} />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</>
	);
};
export default ClientSettledTable;
