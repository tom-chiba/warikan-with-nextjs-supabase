"use client";

import Input from "@/components/Input";
import { createClient } from "@/utils/supabase/client";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { mdiAccountMinus, mdiAccountPlus, mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import { useQuery } from "@tanstack/react-query";
import {
	type ForwardedRef,
	forwardRef,
	useEffect,
	useRef,
	useState,
} from "react";
import { useFormState } from "react-dom";
import { purchaseSchema } from "./_components";
import { createPurchase } from "./_serverActions";

type AmountEntryFieldProps = {
	id: string;
	label: string;
	inputName: string;
	onChange?: (newValue: string) => void;
};

const AmountEntryField = forwardRef(
	(
		{ id, label, inputName, onChange }: AmountEntryFieldProps,
		inputRef: ForwardedRef<HTMLInputElement>,
	) => {
		return (
			<div className="flex gap-4 border-b-2 border-gray-300 p-1 min-w-0">
				<label className="truncate" htmlFor={id}>
					{label}
				</label>
				<div className="flex gap-1">
					<Input
						id={id}
						name={inputName}
						size="small"
						onChange={(e) => onChange?.(e.target.value)}
						ref={inputRef}
					/>
					<span>円</span>
				</div>
			</div>
		);
	},
);

type PurchasersDialogProps = {
	initialPurchasers: {
		id: number;
		name: string;
	}[];
	isOpen: boolean;
	onClose: () => void;
	onCreate: () => void;
	onDelete: () => void;
};

const ClientPurchasersDialog = ({
	initialPurchasers,
	isOpen,
	onClose,
	onCreate,
	onDelete,
}: PurchasersDialogProps) => {
	const supabase = createClient();

	const dialogRef = useRef<HTMLDialogElement>(null);
	const [inputPurchaserName, setInputPurchaserName] = useState<
		string | undefined
	>();
	const [tempPurchasers, setTempPurchasers] = useState<
		{
			id: string;
			name: string;
		}[]
	>([]);
	const [purchasersIdToDelete, setPurchasersIdToDelete] = useState<
		(number | string)[] | undefined
	>();

	const createPurchaser = async () => {
		if (!tempPurchasers.length) return;

		const { error } = await supabase
			.from("purchasers")
			.insert(tempPurchasers.map((purchaser) => ({ name: purchaser.name })))
			.select();
		if (error) throw new Error(error.message);

		onCreate();
	};
	const deletePurchasers = async () => {
		if (!purchasersIdToDelete) return;

		const { error } = await supabase
			.from("purchasers")
			.delete()
			.in("id", purchasersIdToDelete);
		if (error) throw new Error(error.message);

		onDelete();
	};
	const fetchPurchaser = async () => {
		const { data: purchasers, error } = await supabase
			.from("purchasers")
			.select("id, name")
			.order("created_at", { ascending: true });
		if (error) throw new Error(error.message);

		return purchasers;
	};

	const purchasersCache = useQuery({
		queryKey: ["purchasers"],
		queryFn: fetchPurchaser,
		initialData: initialPurchasers,
	});

	const renderMemberLi = (
		purchaser:
			| {
					id: number;
					name: string;
			  }
			| { id: string; name: string },
	) => (
		<li
			className={`border-b-2 border-gray-300 py-2 flex justify-between${
				purchasersIdToDelete?.some((x) => x === purchaser.id)
					? " text-red-500"
					: ""
			}`}
			key={purchaser.id}
		>
			<div className="truncate">{purchaser.name}</div>
			{(() => {
				if (!purchasersIdToDelete) return null;
				if (purchasersIdToDelete.some((x) => x === purchaser.id))
					return (
						<button
							type="button"
							className="flex gap-1"
							onClick={() =>
								setPurchasersIdToDelete((prev) => {
									if (!prev) throw new Error();
									return prev.filter((x) => x !== purchaser.id);
								})
							}
						>
							<Icon path={mdiClose} size={1} />
							キャンセル
						</button>
					);
				return (
					<button
						type="button"
						className="flex gap-1"
						onClick={() =>
							setPurchasersIdToDelete((prev) =>
								prev ? [...prev, purchaser.id] : [purchaser.id],
							)
						}
					>
						<Icon path={mdiClose} size={1} />
						削除
					</button>
				);
			})()}
		</li>
	);

	useEffect(() => {
		if (isOpen) {
			dialogRef.current?.showModal();
			return;
		}
		dialogRef.current?.close();
	}, [isOpen]);

	return (
		<dialog className="px-4 py-2" ref={dialogRef} onClose={onClose}>
			<header className="flex items-center justify-between gap-1 ">
				<h1>メンバー管理</h1>
				<div className="flex gap-1">
					<button
						className="border px-1 bg-gray-200"
						type="button"
						onClick={() => {
							setPurchasersIdToDelete(undefined);
							setInputPurchaserName((prev) => {
								if (prev === undefined) return "";
								return undefined;
							});
						}}
					>
						<Icon path={mdiAccountPlus} size={1} />
					</button>
					<button
						className="border px-1 bg-gray-200"
						type="button"
						onClick={() => {
							setInputPurchaserName(undefined);
							setPurchasersIdToDelete((prev) => (prev ? undefined : []));
						}}
					>
						<Icon path={mdiAccountMinus} size={1} />
					</button>
				</div>
			</header>
			<div className="py-4">
				<ul>
					{purchasersCache.data.map((purchaser) => renderMemberLi(purchaser))}
					{tempPurchasers.map((purchaser) => renderMemberLi(purchaser))}
					{inputPurchaserName !== undefined && (
						<li className="border-b-2 border-gray-300 py-2">
							<div className="bg-blue-50 flex justify-between px-1">
								<input
									type="text"
									className="bg-transparent flex-1 focus-visible:outline-none"
									value={inputPurchaserName}
									onChange={(e) => setInputPurchaserName(e.target.value)}
								/>
								<Icon path={mdiClose} size={1} className="text-gray-400" />
							</div>
						</li>
					)}
				</ul>
			</div>
			<footer className="text-center">
				<button
					className="bg-gray-200 px-3 shadow"
					type="button"
					onClick={() => {
						if (inputPurchaserName === undefined) {
							dialogRef.current?.close();
							(async () => {
								await Promise.all([createPurchaser(), deletePurchasers()]);
								purchasersCache.refetch();
							})();
							setTempPurchasers([]);
						}
						if (inputPurchaserName) {
							setTempPurchasers((prev) => [
								...prev,
								{ id: new Date().toString(), name: inputPurchaserName },
							]);
						}
						setInputPurchaserName(undefined);
					}}
				>
					完了
				</button>
			</footer>
		</dialog>
	);
};

type ClientFormProps = {
	initialPurchasers: {
		id: number;
		name: string;
	}[];
};

export const ClientForm = ({ initialPurchasers }: ClientFormProps) => {
	const supabase = createClient();

	const [clientPurchasersDialogIsOpen, setClientPurchasersDialogIsOpen] =
		useState(false);

	const createPurchaseWithPurchasers = createPurchase.bind(
		null,
		initialPurchasers.map((x) => x.id),
	);

	const [lastResult, action] = useFormState(
		createPurchaseWithPurchasers,
		undefined,
	);
	const [form, fields] = useForm({
		lastResult,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: purchaseSchema });
		},
		shouldValidate: "onBlur",
		defaultValue: {
			purchasers: initialPurchasers.map((x) => ({ name: x.name })),
		},
	});
	const purchasersFieldList = fields.purchasers.getFieldList();

	const amountPaidMapRefs = useRef<Map<string, HTMLInputElement> | null>(null);
	const amountToPayMapRefs = useRef<Map<string, HTMLInputElement> | null>(null);
	const getAmountPaidMap = () => {
		if (!amountPaidMapRefs.current) amountPaidMapRefs.current = new Map();

		return amountPaidMapRefs.current;
	};
	const getAmountToPayMap = () => {
		if (!amountToPayMapRefs.current) amountToPayMapRefs.current = new Map();

		return amountToPayMapRefs.current;
	};

	const equallyDivideCheckRef = useRef<HTMLInputElement>(null);

	const divideEqually = () => {
		const amountPaidMap = getAmountPaidMap();
		const amountToPayMap = getAmountToPayMap();

		let amountPaidSum = 0;
		for (const amountPaidRef of Array.from(amountPaidMap.values()))
			amountPaidSum += Number(amountPaidRef.value);

		for (const amountToPayRef of Array.from(amountToPayMap.values()))
			amountToPayRef.value = String(
				amountPaidSum / purchasersCache.data.length,
			);
	};

	const fetchPurchaser = async () => {
		const { data: purchasers, error } = await supabase
			.from("purchasers")
			.select("id, name")
			.order("created_at", { ascending: true });
		if (error) throw new Error(error.message);

		return purchasers;
	};

	const purchasersCache = useQuery({
		queryKey: ["purchasers"],
		queryFn: fetchPurchaser,
		initialData: initialPurchasers,
	});

	useEffect(() => {
		form.errors && alert(form.errors);
	}, [form.errors]);

	useEffect(() => {
		if (fields.purchasers.getFieldList().length === purchasersCache.data.length)
			return;

		for (const _ of fields.purchasers.getFieldList()) {
			form.remove({ name: fields.purchasers.name, index: 0 });
		}
		purchasersCache.data.forEach((x, index) => {
			form.insert({
				name: fields.purchasers.name,
				index,
				defaultValue: { name: x.name },
			});
		});
	}, [fields.purchasers, form, purchasersCache.data]);

	return (
		<>
			<form id={form.id} action={action} onSubmit={form.onSubmit} noValidate>
				<div>
					<label htmlFor={fields.title.id}>購入品名</label>
					<Input id={fields.title.id} name={fields.title.name} />
					<p>{fields.title.errors}</p>
				</div>
				<div>
					<label htmlFor={fields.date.id}>購入日</label>
					<Input id={fields.date.id} type="date" name={fields.date.name} />
					<p>{fields.date.errors}</p>
				</div>
				<div>
					<label htmlFor={fields.note.id}>メモ</label>
					<Input id={fields.note.id} name={fields.note.name} />
					<p>{fields.note.errors}</p>
				</div>
				<button
					className="border"
					type="button"
					onClick={() => setClientPurchasersDialogIsOpen(true)}
				>
					メンバー管理
				</button>
				<div>
					<span>支払額</span>
					<div>
						{purchasersFieldList.map((x) => {
							const fieldSet = x.getFieldset();

							return (
								<div key={fieldSet.amountPaid.key} className="flex justify-end">
									<AmountEntryField
										id={fieldSet.amountPaid.id}
										label={fieldSet.name.initialValue ?? ""}
										inputName={fieldSet.amountPaid.name}
										ref={(node) => {
											const amountPaidMap = getAmountPaidMap();
											if (node) {
												amountPaidMap.set(fieldSet.amountPaid.id, node);
											} else {
												amountPaidMap.delete(fieldSet.amountPaid.id);
											}
										}}
										onChange={() => {
											if (!equallyDivideCheckRef.current?.checked) return;

											divideEqually();
										}}
									/>
									<p>{fieldSet.amountPaid.errors}</p>
								</div>
							);
						})}
					</div>
				</div>
				<div>
					<span>割勘金額</span>
					<div>
						<input
							ref={equallyDivideCheckRef}
							type="checkbox"
							id="equallyDivideCheck"
							onChange={() => {
								if (!equallyDivideCheckRef.current?.checked) return;

								divideEqually();
							}}
						/>
						<label htmlFor="equallyDivideCheck">等分</label>
					</div>
					<div>
						{purchasersFieldList.map((x) => {
							const fieldSet = x.getFieldset();

							return (
								<div
									key={fieldSet.amountToPay.key}
									className="flex justify-end"
								>
									<AmountEntryField
										id={fieldSet.amountToPay.id}
										label={fieldSet.name.initialValue ?? ""}
										inputName={fieldSet.amountToPay.name}
										ref={(node) => {
											const amountToPayMap = getAmountToPayMap();
											if (node) {
												amountToPayMap.set(fieldSet.amountToPay.id, node);
											} else {
												amountToPayMap.delete(fieldSet.amountToPay.id);
											}
										}}
									/>
									<p>{fieldSet.amountToPay.errors}</p>
								</div>
							);
						})}
					</div>
				</div>
				<button type="submit">追加</button>
				<ClientPurchasersDialog
					isOpen={clientPurchasersDialogIsOpen}
					onClose={() => setClientPurchasersDialogIsOpen(false)}
					initialPurchasers={purchasersCache.data}
					onCreate={fetchPurchaser}
					onDelete={fetchPurchaser}
				/>
			</form>
		</>
	);
};
