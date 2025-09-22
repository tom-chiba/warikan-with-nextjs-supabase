import { z } from "zod";

export const purchaseSchema = z
	.object({
		title: z.string().min(1, { message: "必須" }),
		date: z.date().optional(),
		note: z.string().optional(),
		purchasersAmountPaid: z.array(
			z.object({
				amountPaid: z.union([
					z
						.number({ message: "数字を入力してください" })
						.nonnegative({ message: "正の値を入力してください" })
						.int({ message: "整数を入力してください" }),
					z.string().length(0, { message: "数字を入力してください" }),
				]),
			}),
		),
		purchasersAmountToPay: z.array(
			z.object({
				amountToPay: z.union([
					z
						.number({ message: "数字じゃないとダメ" })
						.nonnegative({ message: "0以上の値じゃないとダメ" })
						.int({ message: "整数じゃないとダメ" }),
					z.string().length(0, { message: "数字じゃないとダメ" }),
				]),
			}),
		),
	})
	.superRefine(({ purchasersAmountPaid, purchasersAmountToPay }, ctx) => {
		const purchasersAmountPaidSum = purchasersAmountPaid.reduce(
			(accumulator, currentValue) => {
				if (typeof currentValue.amountPaid === "string") return accumulator;
				return accumulator + currentValue.amountPaid;
			},
			0,
		);
		const purchasersAmountToPaySum = purchasersAmountToPay.reduce(
			(accumulator, currentValue) => {
				if (typeof currentValue.amountToPay === "string") return accumulator;
				return accumulator + currentValue.amountToPay;
			},
			0,
		);
		purchasersAmountPaid.forEach((_, i) => {
			if (purchasersAmountPaidSum !== purchasersAmountToPaySum)
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "支払額と割勘金額の合計が一致していません",
					path: ["purchasersAmountPaid", i, "amountPaid"],
				});
		});
		purchasersAmountToPay.forEach((_, i) => {
			if (purchasersAmountPaidSum !== purchasersAmountToPaySum)
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "支払額と割勘金額の合計が一致していません",
					path: ["purchasersAmountToPay", i, "amountToPay"],
				});
		});
	});

export type PurchaseFormValues = z.infer<typeof purchaseSchema>;

export function getPurchaseFormDefaultValues(
	purchaserNames: string[] = [],
): PurchaseFormValues {
	return {
		title: "",
		date: new Date(),
		note: "",
		purchasersAmountPaid: purchaserNames.map(() => ({ amountPaid: 0 })),
		purchasersAmountToPay: purchaserNames.map(() => ({ amountToPay: 0 })),
	};
}
