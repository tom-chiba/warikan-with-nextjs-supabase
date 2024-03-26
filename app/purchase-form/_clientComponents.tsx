"use client";

import Input from "@/components/clients/Input";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Fragment, useEffect } from "react";
import { useFormState } from "react-dom";
import { purchaseSchema } from "./_components";
import { createPurchase } from "./_serverActions";

type ClientFormProps = {
	purchasers: {
		id: number;
		name: string;
	}[];
};

export const ClientForm = ({ purchasers }: ClientFormProps) => {
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
				<div>
					<span>支払額</span>
					<div>
						{purchasersFieldList.map((x) => {
							const fieldSet = x.getFieldset();

							return (
								<Fragment key={fieldSet.amountPaid.key}>
									<label htmlFor={fieldSet.amountPaid.id}>
										{fieldSet.name.initialValue}
									</label>
									<Input
										id={fieldSet.amountPaid.id}
										name={fieldSet.amountPaid.name}
									/>
									<p>{fieldSet.amountPaid.errors}</p>
								</Fragment>
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
								<Fragment key={fieldSet.amountToPay.key}>
									<label htmlFor={fieldSet.amountToPay.id}>
										{fieldSet.name.initialValue}
									</label>
									<Input
										id={fieldSet.amountToPay.id}
										name={fieldSet.amountToPay.name}
									/>
									<p>{fieldSet.amountToPay.errors}</p>
								</Fragment>
							);
						})}
					</div>
				</div>
				<button type="submit">追加</button>
			</form>
		</>
	);
};
