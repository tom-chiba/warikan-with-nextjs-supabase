"use server";

import { createClient } from "@/utils/supabase/server";
import { parseWithZod } from "@conform-to/zod";
import { purchaseSchema } from "./components";

export const createPurchase = async (
	purchaserIds: number[],
	_: unknown,
	formData: FormData,
) => {
	const supabase = createClient();

	const submission = parseWithZod(formData, {
		schema: purchaseSchema,
	});

	if (submission.status !== "success") {
		return submission.reply();
	}

	const { data: purchaseData, error: purchaseError } = await supabase
		.from("purchases")
		.insert([
			{
				title: submission.value.title,
				purchase_date: submission.value.date || null,
				note: submission.value.note ?? "",
			},
		])
		.select();
	if (purchaseError) {
		return submission.reply({ formErrors: [purchaseError.message] });
	}
	const insertedPurchaseData = purchaseData[0];
	if (!insertedPurchaseData) {
		return submission.reply({
			formErrors: ["Inserted purchase data doesn't exist."],
		});
	}

	console.dir(purchaserIds);
	const { error } = await supabase
		.from("purchasers_purchases")
		.insert(
			submission.value.purchasers.map((x, i) => ({
				purchase_id: insertedPurchaseData.id,
				purchaser_id: purchaserIds[i],
				amount_paid: x.amountPaid ?? null,
				amount_to_pay: x.amountToPay ?? null,
			})),
		)
		.select();
	// TODO: トランザクション処理
	if (error) {
		return submission.reply({
			formErrors: [
				`処理に失敗しました。purchases tableからid=${insertedPurchaseData.id}に紐づく行を削除してください。`,
			],
		});
	}
};
