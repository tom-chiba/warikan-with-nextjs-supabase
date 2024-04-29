import Link from "next/link";
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

type TabListProps = {
	tabItems: {
		label: string;
		href: string;
	}[];
};

export const TabList = ({ tabItems }: TabListProps) => {
	return (
		<ul className="flex border-b-2 border-b-blue-300 pb-1">
			{tabItems.map((x) => (
				<li className="border w-28 p-1" key={x.label}>
					<div className="border-b-2 border-b-blue-300 text-center">
						<Link className="" href={x.href}>
							{x.label}
						</Link>
					</div>
				</li>
			))}
		</ul>
	);
};
