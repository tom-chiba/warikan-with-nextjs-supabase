"use client";

import ErrorMessage from "@/components/ErrorMessage";
import NodataMessage from "@/components/NodataMessage";
import Loader from "@/components/clients/Loader";
import { createClient } from "@/utils/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type TableProps = {
	selectedPurchaseIds: number[];
	onSelectPurchase: (targetId: number) => void;
};

const Table = ({ selectedPurchaseIds, onSelectPurchase }: TableProps) => {
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
					is_settled,
					purchasers_purchases ( id, purchaser_id, amount_paid, amount_to_pay )
				`,
				)
				.eq("is_settled", false)
				.order("created_at", { ascending: true });
			if (purchasesError) throw new Error(purchasesError.message);

			return purchasesData;
		},
		select: (data) =>
			data?.map((x) => ({
				id: x.id,
				title: x.title,
				date: x.purchase_date ?? undefined,
				totalAmount: x.purchasers_purchases.reduce(
					(previous, current) => previous + (current.amount_paid ?? 0),
					0,
				),
			})),
	});

	const deletePurchase = async (purchaseId: number) => {
		const { error } = await supabase
			.from("purchases")
			.delete()
			.eq("id", purchaseId);
		if (error) console.error(error);
		queryClient.invalidateQueries({ queryKey: ["purchases"] });
	};

	const settlePurchase = async (purchaseId: number) => {
		const { error } = await supabase
			.from("purchases")
			.update({ is_settled: true })
			.eq("id", purchaseId)
			.select();
		if (error) console.error(error);
		queryClient.invalidateQueries({ queryKey: ["purchases"] });
	};

	useEffect(() => {
		queryClient.invalidateQueries({ queryKey: ["purchases", "unsettled"] });
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
							<th />
							<th>購入品名</th>
							<th>購入日</th>
							<th>合計金額</th>
							<th>精算</th>
							<th>削除</th>
						</tr>
					</thead>
					<tbody>
						{purchasesCache.data?.map((x) => (
							<tr key={x.id}>
								<td>
									<input
										type="checkbox"
										checked={selectedPurchaseIds.includes(x.id)}
										onChange={() => onSelectPurchase(x.id)}
									/>
								</td>
								<td>{x.title}</td>
								<td>{x.date}</td>
								<td>{x.totalAmount}</td>
								<td>
									<button
										type="button"
										onClick={() => {
											settlePurchase(x.id);
										}}
									>
										精算
									</button>
								</td>
								<td>
									<button
										type="button"
										onClick={() => {
											deletePurchase(x.id);
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

type ClientUnsettledBlockProps = {
	initialPurchasers: {
		id: number;
		name: string;
	}[];
};

export const ClientUnsettledBlock = ({
	initialPurchasers,
}: ClientUnsettledBlockProps) => {
	const supabase = createClient();

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
		initialData: initialPurchasers,
	});

	const purchasesCache = useQuery({
		queryKey: ["purchases"],
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
				.order("created_at", { ascending: true });
			if (purchasesError) throw new Error(purchasesError.message);

			return purchasesData;
		},
	});

	const settlePurchases = async (purchaseIds: number[]) => {
		const { error } = await supabase
			.from("purchases")
			.update({ is_settled: true })
			.in("id", purchaseIds)
			.select();
		if (error) console.error(error);
		purchasesCache.refetch();
	};

	return (
		<>
			<ul>
				{purchasersCache.data.map((x) => (
					<li key={x.id}>
						{x.name}が払う額:　
						{purchasesCache.data?.reduce((previous, current) => {
							if (!selectedPurchaseIds.includes(current.id)) return previous;
							return (
								previous +
								(current.purchasers_purchases.find(
									(y) => y.purchaser_id === x.id,
								)?.amount_to_pay ?? 0) -
								(current.purchasers_purchases.find(
									(y) => y.purchaser_id === x.id,
								)?.amount_paid ?? 0)
							);
						}, 0)}
						円
					</li>
				))}
			</ul>
			<button
				type="button"
				onClick={() => settlePurchases(selectedPurchaseIds)}
			>
				まとめて精算
			</button>
			<Table
				selectedPurchaseIds={selectedPurchaseIds}
				onSelectPurchase={(targetId) => {
					setSelectedPurchaseIds((prev) => {
						const prevWithoutTarget = prev.filter((x) => x !== targetId);
						const alreadyIncludes = prevWithoutTarget.length === prev.length;
						return alreadyIncludes ? [...prev, targetId] : prevWithoutTarget;
					});
				}}
			/>
		</>
	);
};
