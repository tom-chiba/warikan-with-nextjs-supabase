import type { Database } from "@/database.types";
import { z } from "zod";

type toZod<T extends Record<string, unknown>> = {
	[K in keyof T]-?: z.ZodType<T[K]>;
};

export type FormItems = {
	title: string;
	date?: string;
	note?: string;
	purchasers: {
		name?: string;
		amountPaid?: number;
		amountToPay?: number;
	}[];
};

export const purchaseSchema = z.object<toZod<FormItems>>({
	title: z.string().min(1, { message: "必須" }),
	date: z.string().optional(),
	note: z.string().optional(),
	purchasers: z.array(
		z.object({
			name: z.string().optional(),
			amountPaid: z
				.union([
					z
						.number()
						.nonnegative({ message: "0以上の値じゃないとダメ" })
						.int({ message: "正数じゃないとダメ" }),
					z.nan(),
				])
				.optional(),
			amountToPay: z
				.union([
					z
						.number()
						.nonnegative({ message: "0以上の値じゃないとダメ" })
						.int({ message: "正数じゃないとダメ" }),
					z.nan(),
				])
				.optional(),
		}),
	),
});
