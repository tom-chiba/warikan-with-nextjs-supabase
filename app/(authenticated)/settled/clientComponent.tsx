"use client";

import ErrorMessage from "@/components/ErrorMessage";
import NodataMessage from "@/components/NodataMessage";
import Loader from "@/components/clients/Loader";
import { createClient } from "@/utils/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const Table = () => {
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
					is_settled,
					purchasers_purchases ( id, amount_paid, amount_to_pay )
				`,
				)
				.eq("is_settled", true)
				.order("created_at", { ascending: true });
			if (purchasesError) throw new Error(purchasesError.message);

			return purchasesData;
		},
		select: (data) =>
			data.map((x) => ({
				id: x.id,
				title: x.title,
				date: x.purchase_date ?? undefined,
				totalAmount: x.purchasers_purchases.reduce(
					(previous, current) => previous + (current.amount_paid ?? 0),
					0,
				),
			})),
	});

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
			{purchasesCache.status === "error" ? (
				<ErrorMessage />
			) : purchasesCache.status === "pending" ? (
				<Loader isLoading />
			) : purchasesCache.data.length === 0 ? (
				<NodataMessage />
			) : (
				<table>
					<thead>
						<tr>
							<th>購入品名</th>
							<th>購入日</th>
							<th>合計金額</th>
							<th>未精算</th>
							<th>削除</th>
						</tr>
					</thead>
					<tbody>
						{purchasesCache.data.map((x) => (
							<tr key={x.id}>
								<td>{x.title}</td>
								<td>{x.date}</td>
								<td>{x.totalAmount}</td>
								<td>
									<button
										type="button"
										onClick={() => {
											unsettlePurchaseMutation.mutate(x.id);
										}}
									>
										未精算
									</button>
								</td>
								<td>
									<button
										type="button"
										onClick={() => {
											deletePurchaseMutation.mutate(x.id);
										}}
									>
										削除
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</>
	);
};
