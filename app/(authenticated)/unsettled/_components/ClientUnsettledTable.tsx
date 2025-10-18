"use client";

import ErrorMessage from "@/components/ErrorMessage";
import Loader from "@/components/Loader";
import NodataMessage from "@/components/NodataMessage";
import LoaderWithInert from "@/components/clients/LoaderWithInert";
import { GenericTable } from "@/components/ui/GenericTable";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/utils/supabase/client";
import type { UseQueryDataAndStatus } from "@/utils/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
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
};
const ClientUnsettledTable = ({
	selectedPurchaseIds,
	onSelectPurchases,
	initialPurchases,
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
		onError: () => {
			toast.error("精算処理に失敗しました");
		},
	});

	useEffect(() => {
		queryClient.invalidateQueries({ queryKey: ["purchases", "unsettled"] });
	}, [queryClient]);

	if (purchasesCache.isLoading) return <Loader />;
	if (purchaseTableData.status === "error") return <ErrorMessage />;

	return (
		<>
			{deletePurchaseMutation.status === "pending" && <LoaderWithInert />}
			{settlePurchaseMutation.status === "pending" && <LoaderWithInert />}
			{purchaseTableData.data.length === 0 ? (
				<NodataMessage />
			) : (
				<>
					<GenericTable
						columns={[
							{
								key: "select",
								header: (
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
								),
								cell: (purchase) => (
									<Checkbox
										checked={selectedPurchaseIds.includes(purchase.id)}
										onCheckedChange={() => {
											if (selectedPurchaseIds.includes(purchase.id)) {
												onSelectPurchases(
													selectedPurchaseIds.filter((x) => x !== purchase.id),
												);
											} else {
												onSelectPurchases([
													...selectedPurchaseIds,
													purchase.id,
												]);
											}
										}}
									/>
								),
							},
							{
								key: "title",
								header: "購入品名",
								cell: (purchase) => purchase.title,
							},
							{
								key: "date",
								header: "購入日",
								cell: (purchase) => purchase.date,
							},
							{
								key: "totalAmount",
								header: "合計金額(円)",
								cell: (purchase) => purchase.totalAmount,
							},
							{
								key: "menu",
								header: "",
								cell: (purchase) => (
									<ClientControlMenu purchaseId={purchase.id} />
								),
							},
						]}
						data={purchaseTableData.data}
					/>
				</>
			)}
		</>
	);
};
export default ClientUnsettledTable;
