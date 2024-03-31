"use client";

import Input from "@/components/Input";
import type { Database } from "@/database.types";
import { createClient } from "@/utils/supabase/client";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useCallback, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { purchaserSchema } from "./_components";
import { createPurchaser } from "./_serverActions";

export const Form = () => {
	const [lastResult, action] = useFormState(createPurchaser, undefined);
	const [form, fields] = useForm({
		lastResult,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: purchaserSchema });
		},
		shouldValidate: "onBlur",
	});

	return (
		<form id={form.id} onSubmit={form.onSubmit} action={action} noValidate>
			<label htmlFor={fields.name.id}>追加する購入者名</label>
			<Input id={fields.name.id} name={fields.name.name} />
			<p>{fields.name.errors}</p>
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
