"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import type { UseQueryDataAndStatus } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {} from "@mdi/js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

type ClientFormProps = {
	initialPurchasers: {
		id: number;
		name: string;
	}[];
};

const purchaseSchema = z
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

export const usePurchaseForm = (
	initialPurchasers: ClientFormProps["initialPurchasers"],
	purchaseIdForUpdate?: number,
	formDefaultValues?: Required<
		Parameters<typeof useForm<z.infer<typeof purchaseSchema>>>
	>[0]["defaultValues"],
	onSuccessUpdatePurchase?: () => void,
) => {
	const supabase = createClient();
	const queryClient = useQueryClient();

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
	const createPurchaseMutation = useMutation({
		mutationFn: async ({
			title,
			date,
			note,
			purchasersAmountPaid,
			purchasersAmountToPay,
		}: z.infer<typeof purchaseSchema>) => {
			const { data: purchaseData, error: purchaseError } = await supabase
				.from("purchases")
				.insert([
					{
						title: title,
						purchase_date: date?.toLocaleDateString("sv-SE") || null, // NOTE: 参考記事→https://www.ey-office.com/blog_archive/2023/04/18/short-code-to-get-todays-date-in-yyyy-mm-dd-format-in-javascript/
						note: note ?? "",
					},
				])
				.select();
			if (purchaseError) throw new Error(purchaseError.message);

			const insertedPurchaseData = purchaseData[0];

			const { error: purchasersPurchasesError } = await supabase
				.from("purchasers_purchases")
				.insert(
					purchasersAmountPaid.map((x, i) => ({
						purchase_id: insertedPurchaseData.id,
						purchaser_id: purchasersCache.data[i].id,
						amount_paid: typeof x.amountPaid === "number" ? x.amountPaid : null,
						amount_to_pay:
							typeof purchasersAmountToPay[i].amountToPay === "number"
								? purchasersAmountToPay[i].amountToPay
								: null,
					})),
				)
				.select();

			// TODO: トランザクション処理
			if (purchasersPurchasesError)
				throw new Error(
					`処理に失敗しました。purchases tableからid=${insertedPurchaseData.id}に紐づく行を削除してください。`,
				);
		},
		onSuccess: () => form.reset(),
		throwOnError: true,
	});
	const updatePurchaseMutation = useMutation({
		mutationFn: async ({
			title,
			date,
			note,
			purchasersAmountPaid,
			purchasersAmountToPay,
		}: z.infer<typeof purchaseSchema>) => {
			if (!purchaseIdForUpdate) return;

			const { data: purchaseData, error: purchaseError } = await supabase
				.from("purchases")
				.update({
					title: title,
					purchase_date: date?.toLocaleDateString("sv-SE") || null,
					note: note ?? "",
				})
				.eq("id", purchaseIdForUpdate)
				.select();
			if (purchaseError) throw new Error(purchaseError.message);

			const updatedPurchaseData = purchaseData[0];

			for (const [i, x] of purchasersAmountPaid.entries()) {
				const { error: purchasersPurchasesError } = await supabase
					.from("purchasers_purchases")
					.update({
						amount_paid: typeof x.amountPaid === "number" ? x.amountPaid : null,
						amount_to_pay:
							typeof purchasersAmountToPay[i].amountToPay === "number"
								? purchasersAmountToPay[i].amountToPay
								: null,
					})
					.eq("purchase_id", purchaseIdForUpdate)
					.eq("purchaser_id", purchasersCache.data[i].id)
					.select();

				// TODO: トランザクション処理
				if (purchasersPurchasesError)
					throw new Error(
						`処理に失敗しました。purchases tableからid=${updatedPurchaseData.id}に紐づく行を削除してください。`,
					);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["purchases"],
			});
			onSuccessUpdatePurchase?.();
		},
		throwOnError: true,
	});

	const purchaserNames: UseQueryDataAndStatus<string[]> =
		purchasersCache.status !== "success"
			? {
					status: purchasersCache.status,
					data: undefined,
					isRefetching: purchasersCache.isRefetching,
				}
			: {
					status: "success",
					data: purchasersCache.data?.map((x) => x.name),
					isRefetching: purchasersCache.isRefetching,
				};

	const form = useForm<z.infer<typeof purchaseSchema>>({
		resolver: zodResolver(purchaseSchema),
		defaultValues: formDefaultValues ?? {
			title: "",
			date: new Date(),
			note: "",
			purchasersAmountPaid:
				purchaserNames.data?.map(() => ({ amountPaid: 0 })) ?? [],
			purchasersAmountToPay:
				purchaserNames.data?.map(() => ({ amountToPay: 0 })) ?? [],
		},
	});

	const { fields: purchasersAmountPaidFields } = useFieldArray({
		control: form.control,
		name: "purchasersAmountPaid",
	});
	const {
		fields: purchasersAmountToPayFields,
		replace: purchasersAmountToPayReplace,
	} = useFieldArray({
		control: form.control,
		name: "purchasersAmountToPay",
	});

	const handleSubmitCreate = (values: z.infer<typeof purchaseSchema>) => {
		createPurchaseMutation.mutate(values);
	};
	const handleSubmitUpdate = (values: z.infer<typeof purchaseSchema>) => {
		updatePurchaseMutation.mutate(values);
	};

	const calculateDistributeRemainderRandomly = (amountPaidSum: number) => {
		const quotient = Math.floor(
			amountPaidSum / watchedPurchasersAmountPaid.length,
		);
		let remainder = amountPaidSum % watchedPurchasersAmountPaid.length;

		const distribution: { amountToPay: number }[] = [
			...Array(watchedPurchasersAmountPaid.length),
		].map(() => ({
			amountToPay: quotient,
		}));

		while (remainder > 0) {
			const randomIndex = Math.floor(
				Math.random() * watchedPurchasersAmountPaid.length,
			);
			distribution[randomIndex].amountToPay += 1;
			remainder--;
		}

		purchasersAmountToPayReplace(distribution);
	};

	const watchedPurchasersAmountPaid = form.watch("purchasersAmountPaid");

	const purchasersAmountPaidSum = watchedPurchasersAmountPaid.reduce(
		(accumulator, currentValue) =>
			accumulator +
			(typeof currentValue.amountPaid === "number"
				? currentValue.amountPaid
				: 0),
		0,
	);

	return {
		purchasersCache,
		purchaserNames,
		form,
		purchasersAmountPaidFields,
		purchasersAmountToPayFields,
		handleSubmitCreate,
		handleSubmitUpdate,
		calculateDistributeRemainderRandomly,
		watchedPurchasersAmountPaid,
		purchasersAmountPaidSum,
	};
};

export const ClientForm = ({ initialPurchasers }: ClientFormProps) => {
	const [equallyDivideCheckIsChecked, setEquallyDivideCheckIsChecked] =
		useState(false);
	const [dateInputPopoverIsOpen, setDateInputPopoverIsOpen] = useState(false);

	const {
		purchaserNames,
		form,
		purchasersAmountPaidFields,
		purchasersAmountToPayFields,
		handleSubmitCreate,
		calculateDistributeRemainderRandomly,
		watchedPurchasersAmountPaid,
		purchasersAmountPaidSum,
	} = usePurchaseForm(initialPurchasers);

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmitCreate)}
				className="space-y-8"
			>
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel>購入品名</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="date"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel>購入日</FormLabel>
							<Popover
								open={dateInputPopoverIsOpen}
								onOpenChange={setDateInputPopoverIsOpen}
							>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant={"outline"}
											className={cn(
												"w-[240px] pl-3 text-left font-normal",
												!field.value && "text-muted-foreground",
											)}
										>
											{field.value ? (
												format(field.value, "PPP")
											) : (
												<span>Pick a date</span>
											)}
											<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={field.value}
										onSelect={(date) => {
											field.onChange(date);
											setDateInputPopoverIsOpen(false);
										}}
										required
										disabled={(date) =>
											date > new Date() || date < new Date("1900-01-01")
										}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="note"
					render={({ field }) => (
						<FormItem>
							<FormLabel>メモ</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{purchaserNames.status === "error" ? (
					<p>error</p>
				) : (
					<>
						<Card>
							<CardHeader>
								<CardTitle>支払額</CardTitle>
							</CardHeader>
							<CardContent>
								<ul>
									{purchasersAmountPaidFields.map((item, index) => (
										<li key={item.id} className="py-4">
											<FormField
												control={form.control}
												name={`purchasersAmountPaid.${index}.amountPaid`}
												render={({ field }) => (
													<FormItem>
														<FormLabel>{purchaserNames.data[index]}</FormLabel>
														<FormControl>
															<Input
																{...field}
																onChange={(e) => {
																	const inputValue = e.target.value;
																	const inputValueAsNumber = Number(inputValue);
																	if (
																		!inputValue ||
																		Number.isNaN(inputValueAsNumber)
																	)
																		field.onChange(inputValue);
																	else field.onChange(inputValueAsNumber);

																	if (!equallyDivideCheckIsChecked) return;

																	const amountPaidSum =
																		watchedPurchasersAmountPaid.reduce(
																			(
																				accumulator,
																				currentValue,
																				currentIndex,
																			) => {
																				if (currentIndex === index)
																					return (
																						accumulator +
																						Number(e.target.value ?? 0)
																					);
																				return (
																					accumulator +
																					Number(currentValue.amountPaid ?? 0)
																				);
																			},
																			0,
																		);

																	calculateDistributeRemainderRandomly(
																		amountPaidSum,
																	);
																}}
																placeholder="0"
																inputMode="numeric"
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</li>
									))}
								</ul>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>割勘金額</CardTitle>
							</CardHeader>
							<CardContent>
								<Switch
									id="equallyDivideCheck"
									onCheckedChange={() => {
										setEquallyDivideCheckIsChecked((prev) => !prev);

										if (equallyDivideCheckIsChecked) return;

										const amountPaidSum = watchedPurchasersAmountPaid.reduce(
											(accumulator, currentValue) => {
												return (
													accumulator + Number(currentValue.amountPaid ?? 0)
												);
											},
											0,
										);

										calculateDistributeRemainderRandomly(amountPaidSum);
									}}
									checked={equallyDivideCheckIsChecked}
								/>
								<Label htmlFor="equallyDivideCheck">等分</Label>

								<ul>
									{purchasersAmountToPayFields.map((item, index) => (
										<li key={item.id} className="py-4">
											<FormField
												control={form.control}
												name={`purchasersAmountToPay.${index}.amountToPay`}
												render={({ field }) => (
													<FormItem>
														<div className="flex items-center justify-between">
															<FormLabel>
																{purchaserNames.data[index]}
															</FormLabel>
															<Button
																type="button"
																className="h-8"
																variant="outline"
																onClick={() => {
																	const otherPurchaserAmountToPays = form
																		.getValues()
																		.purchasersAmountToPay.reduce(
																			(
																				accumulator,
																				currentValue,
																				currentIndex,
																			) => {
																				if (currentIndex === index)
																					return accumulator;
																				return (
																					accumulator +
																					(typeof currentValue.amountToPay ===
																					"number"
																						? currentValue.amountToPay
																						: 0)
																				);
																			},
																			0,
																		);
																	field.onChange(
																		purchasersAmountPaidSum -
																			otherPurchaserAmountToPays,
																	);
																}}
															>
																残りを自動入力
															</Button>
														</div>
														<FormControl>
															<Input
																{...field}
																onChange={(e) => {
																	const inputValue = e.target.value;
																	const inputValueAsNumber = Number(inputValue);
																	if (
																		!inputValue ||
																		Number.isNaN(inputValueAsNumber)
																	)
																		field.onChange(e);
																	else field.onChange(inputValueAsNumber);
																}}
																placeholder="0"
																inputMode="numeric"
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					</>
				)}

				<Button type="submit">追加</Button>
			</form>
		</Form>
	);
};
