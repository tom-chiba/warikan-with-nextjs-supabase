"use client";

import Input from "@/components/Input";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { purchaseSchema } from "./_components";
import { createPurchase } from "./_serverActions";

type AmountEntryFieldProps = {
	id: string;
	label: string;
	inputName: string;
};

const AmountEntryField = ({ id, label, inputName }: AmountEntryFieldProps) => {
	return (
		<div className="flex gap-4 border-b-2 border-gray-300 p-1 min-w-0">
			<label className="truncate" htmlFor={id}>
				{label}
			</label>
			<div className="flex gap-1">
				<Input id={id} name={inputName} size="small" />
				<span>円</span>
			</div>
		</div>
	);
};

type PurchasersDialogProps = {
	purchasers: {
		id: number;
		name: string;
	}[];
	isOpen: boolean;
	onClose: () => void;
};

export const ClientPurchasersDialog = ({
	purchasers,
	isOpen,
	onClose,
}: PurchasersDialogProps) => {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		if (isOpen) {
			dialogRef.current?.showModal();
			return;
		}
		dialogRef.current?.close();
	}, [isOpen]);

	return (
		<dialog ref={dialogRef} onClose={onClose}>
			<header className="flex gap-1">
				<h1>メンバー管理</h1>
				<button className="border" type="button">
					追加
				</button>
				<button className="border" type="button">
					削除
				</button>
			</header>
			<div>
				<ul>
					{purchasers.map((purchaser) => (
						<li key={purchaser.id}>{purchaser.name}</li>
					))}
				</ul>
			</div>
			<footer>
				<button
					className="border"
					type="button"
					onClick={() => dialogRef.current?.close()}
				>
					完了
				</button>
			</footer>
		</dialog>
	);
};

type ClientFormProps = {
	purchasers: {
		id: number;
		name: string;
	}[];
};

export const ClientForm = ({ purchasers }: ClientFormProps) => {
	const [clientPurchasersDialogIsOpen, setClientPurchasersDialogIsOpen] =
		useState(false);

	const createPurchaseWithPurchasers = createPurchase.bind(
		null,
		purchasers.map((x) => x.id),
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
			purchasers: purchasers.map((x) => ({ name: x.name })),
		},
	});
	const purchasersFieldList = fields.purchasers.getFieldList();

	useEffect(() => {
		form.errors && alert(form.errors);
	}, [form.errors]);

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
					purchasers={purchasers}
				/>
			</form>
		</>
	);
};
