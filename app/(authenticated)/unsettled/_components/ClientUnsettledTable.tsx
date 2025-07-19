"use client";

import ErrorMessage from "@/components/ErrorMessage";
import NodataMessage from "@/components/NodataMessage";
import Loader from "@/components/clients/Loader";
import { Checkbox } from "@/components/ui/checkbox";
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
import { type ComponentProps, useEffect } from "react";
import ClientControlMenu from "./ClientControlMenu";

type ClientUnsettledTableProps = {
	selectedPurchaseIds: number[];
	onSelectPurchases: (newSelectedPurchaseIds: number[]) => void;
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
	initialPurchasers: ComponentProps<
		typeof ClientControlMenu
	>["initialPurchasers"];
};
const ClientUnsettledTable = ({
	selectedPurchaseIds,
	onSelectPurchases,
	initialPurchases,
	initialPurchasers,
}: ClientUnsettledTableProps) => {
	const supabase = createClient();
	const queryClient = useQueryClient();

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
					note,
					is_settled,
					purchasers_purchases ( id, purchaser_id, amount_paid, amount_to_pay )
				`,
				)
				.eq("is_settled", false)
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

	const getAllPurchaseIds = (
		purchasesCacheData: (typeof purchasesCache)["data"],
	): number[] => purchasesCacheData.map((x) => x.id);

	const getAllPurchasesAreChecked = (
		purchasesCacheData: (typeof purchasesCache)["data"],
	): boolean =>
		getAllPurchaseIds(purchasesCacheData).every((x) =>
			selectedPurchaseIds.includes(x),
		);

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

	const settlePurchaseMutation = useMutation({
		mutationFn: async (purchaseId: number) => {
			const { error } = await supabase
				.from("purchases")
				.update({ is_settled: true })
				.eq("id", purchaseId)
				.select();
			if (error) throw new Error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["purchases"] });
		},
	});

	useEffect(() => {
		queryClient.invalidateQueries({ queryKey: ["purchases", "unsettled"] });
	}, [queryClient]);

	return (
		<>
			{purchaseTableData.status === "error" ||
			deletePurchaseMutation.status === "error" ||
			settlePurchaseMutation.status === "error" ? (
				<ErrorMessage />
			) : deletePurchaseMutation.status === "pending" ||
				settlePurchaseMutation.status === "pending" ? (
				<Loader isLoading />
			) : purchaseTableData.data.length === 0 ? (
				<NodataMessage />
			) : (
				<>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[20px]">
									<Checkbox
										checked={getAllPurchasesAreChecked(purchasesCache.data)}
										onCheckedChange={() =>
											onSelectPurchases(
												getAllPurchasesAreChecked(purchasesCache.data)
													? []
													: getAllPurchaseIds(purchasesCache.data),
											)
										}
									/>
								</TableHead>
								<TableHead>購入品名</TableHead>
								<TableHead>購入日</TableHead>
								<TableHead>合計金額(円)</TableHead>
								<TableHead className="w-[20px]" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{purchaseTableData.data.map((purchase) => (
								<TableRow key={purchase.id}>
									<TableCell>
										<Checkbox
											checked={selectedPurchaseIds.includes(purchase.id)}
											onCheckedChange={() => {
												if (selectedPurchaseIds.includes(purchase.id))
													onSelectPurchases(
														selectedPurchaseIds.filter(
															(x) => x !== purchase.id,
														),
													);
												else
													onSelectPurchases([
														...selectedPurchaseIds,
														purchase.id,
													]);
											}}
										/>
									</TableCell>
									<TableCell>{purchase.title}</TableCell>
									<TableCell>{purchase.date}</TableCell>
									<TableCell>{purchase.totalAmount}</TableCell>
									<TableCell>
										<ClientControlMenu
											initialPurchasers={initialPurchasers}
											purchaseId={purchase.id}
											purchase={{
												title: purchase.title,
												date: purchase.date
													? new Date(purchase.date)
													: undefined,
												note: purchase.note,
												purchasersAmountPaid: purchase.purchasers.map((x) => ({
													amountPaid: x.amount_paid ?? 0,
												})),
												purchasersAmountToPay: purchase.purchasers.map((x) => ({
													amountToPay: x.amount_to_pay ?? 0,
												})),
											}}
										/>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</>
			)}
		</>
	);
};
export default ClientUnsettledTable;
