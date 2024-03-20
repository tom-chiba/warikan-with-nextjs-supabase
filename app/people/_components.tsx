"use client";

import type { Database } from "@/database.types";
import { createClient } from "@/utils/supabase/client";
import { useCallback, useEffect, useId, useRef, useState } from "react";

export const Form = () => {
	const componentId = useId();
	const purchaserNameRef = useRef<HTMLInputElement>(null);

	const supabase = createClient();

	const createPurchaser = async () => {
		const { error } = await supabase
			.from("purchasers")
			.insert([{ name: purchaserNameRef.current?.value ?? "" }])
			.select();
		if (error) {
			console.error(error);
		}
	};

	return (
		<form
			action={() => {
				createPurchaser();
			}}
		>
			<label htmlFor={`${componentId}-purchaserName`}>追加する購入者名</label>
			<input
				ref={purchaserNameRef}
				id={`${componentId}-purchaserName`}
				type="text"
				className="text-black"
			/>
			<button type="submit">追加</button>
		</form>
	);
};

export const Table = () => {
	const supabase = createClient();

	const [purchasers, setPurchasers] = useState<
		| {
				data: Database["public"]["Tables"]["purchasers"]["Row"];
				isEditMode: boolean;
		  }[]
		| null
	>([]);
	const [editingPurchaserName, setEditingPurchaserName] = useState<
		string | null
	>(null);

	const readPurchaser = useCallback(async () => {
		const { data: purchasers, error } = await supabase
			.from("purchasers")
			.select("*")
			.order("created_at", { ascending: true });
		if (error) {
			console.error(error);
			return;
		}
		setPurchasers(
			purchasers?.map((x) => ({ data: x, isEditMode: false })) ?? null,
		);
	}, [supabase]);

	const deletePurchaser = async (purchaserId: number) => {
		const { error } = await supabase
			.from("purchasers")
			.delete()
			.eq("id", purchaserId);
		if (error) console.error(error);
		readPurchaser();
	};

	const updatePurchaser = async (
		purchaserId: number,
		newPurchaserName: string,
	) => {
		const { error } = await supabase
			.from("purchasers")
			.update({ name: newPurchaserName })
			.eq("id", purchaserId)
			.select();
		if (error) {
			console.error(error);
			return;
		}
		readPurchaser();
	};

	useEffect(() => {
		readPurchaser();
	}, [readPurchaser]);

	return (
		<div>
			<span>リロードしないと購入者名は更新されないので注意</span>
			<table>
				<thead>
					<tr>
						<th>購入者名</th>
						<th>削除</th>
						<th>編集</th>
					</tr>
				</thead>
				<tbody>
					{purchasers?.map((x) => (
						<tr key={x.data.id}>
							<td>
								{x.isEditMode ? (
									<input
										className="text-black"
										onChange={(e) => {
											setEditingPurchaserName(e.target.value);
										}}
										value={editingPurchaserName ?? ""}
									/>
								) : (
									<span>{x.data.name}</span>
								)}
							</td>
							<td>
								<button
									type="button"
									onClick={() => {
										deletePurchaser(x.data.id);
									}}
								>
									削除
								</button>
							</td>
							<td>
								{x.isEditMode ? (
									<button
										type="button"
										onClick={() => {
											if (editingPurchaserName)
												updatePurchaser(x.data.id, editingPurchaserName);
										}}
									>
										確定
									</button>
								) : (
									<button
										type="button"
										onClick={() => {
											setEditingPurchaserName(x.data.name);
											setPurchasers(
												(prev) =>
													prev?.map((y) =>
														y.data.id === x.data.id
															? { ...y, isEditMode: true }
															: y,
													) ?? null,
											);
										}}
									>
										編集
									</button>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
