"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
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
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import type { UseQueryDataAndStatus } from "@/utils/supabase/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {} from "@mdi/js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Check, Edit, Trash, X } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

type ClientPurchasersDialogProps = {
	initialPurchasers: {
		id: number;
		name: string;
	}[];
};
const ClientPurchasersDialog = ({
	initialPurchasers,
}: ClientPurchasersDialogProps) => {
	const supabase = createClient();
	const queryClient = useQueryClient();

	const [inputPurchaser, setInputPurchaser] = useState<
		{ id: number | undefined; name: string } | undefined
	>(undefined);

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

	const createPurchaserMutation = useMutation({
		mutationFn: async (name: string) => {
			const { error } = await supabase
				.from("purchasers")
				.insert({ name })
				.select();
			if (error) throw new Error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["purchasers"] });
		},
	});

	const updatePurchaserMutation = useMutation({
		mutationFn: async ({ id, newName }: { id: number; newName: string }) => {
			const { data, error } = await supabase
				.from("purchasers")
				.update({ name: newName })
				.eq("id", id)
				.select();
			if (error) throw new Error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["purchasers"] });
		},
	});

	const deletePurchaserMutation = useMutation({
		mutationFn: async (id: number) => {
			const { error } = await supabase.from("purchasers").delete().eq("id", id);
			if (error) throw new Error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["purchasers"] });
		},
	});

	const endEditingPurchaserName = (mode: "create" | "update") => {
		if (!inputPurchaser) return;
		if (!inputPurchaser.name) return;
		switch (mode) {
			case "create": {
				createPurchaserMutation.mutate(inputPurchaser.name);
				break;
			}
			case "update": {
				if (!inputPurchaser.id) return;
				updatePurchaserMutation.mutate({
					id: inputPurchaser.id,
					newName: inputPurchaser.name,
				});
				break;
			}
		}
		setInputPurchaser(undefined);
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline">メンバー管理</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>メンバー管理</DialogTitle>
				</DialogHeader>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[200px]">名前</TableHead>
							<TableHead className="w-[20px]" />
							<TableHead className="w-[20px]" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{purchasersCache.data.map((purchaser) => (
							<TableRow key={purchaser.name}>
								<TableCell className="font-medium">
									{inputPurchaser?.id === purchaser.id ? (
										<Input
											value={inputPurchaser.name}
											onChange={(e) =>
												setInputPurchaser((prev) => {
													if (!prev) return prev;
													return {
														...prev,
														name: e.target.value,
													};
												})
											}
											onKeyDown={(e) => {
												if (e.key === "Enter")
													endEditingPurchaserName("update");
											}}
										/>
									) : (
										<>{purchaser.name}</>
									)}
								</TableCell>

								<TableCell>
									{inputPurchaser?.id === purchaser.id ? (
										<Button
											size="icon"
											onClick={() => endEditingPurchaserName("update")}
											disabled={!inputPurchaser.name}
										>
											<Check className="h-4 w-4" />
										</Button>
									) : (
										<Button
											variant="outline"
											size="icon"
											onClick={() =>
												setInputPurchaser({
													id: purchaser.id,
													name: purchaser.name,
												})
											}
											disabled={inputPurchaser !== undefined}
										>
											<Edit className="h-4 w-4" />
										</Button>
									)}
								</TableCell>

								<TableCell>
									{inputPurchaser?.id === purchaser.id ? (
										<Button
											variant="outline"
											size="icon"
											onClick={() => setInputPurchaser(undefined)}
										>
											<X className="h-4 w-4" />
										</Button>
									) : (
										<Button
											size="icon"
											onClick={() =>
												deletePurchaserMutation.mutate(purchaser.id)
											}
											disabled={inputPurchaser !== undefined}
										>
											<Trash className="h-4 w-4" />
										</Button>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
					<TableFooter>
						<TableRow>
							{inputPurchaser && inputPurchaser.id === undefined ? (
								<>
									<TableCell>
										<Input
											value={inputPurchaser?.name}
											onChange={(e) =>
												setInputPurchaser((prev) => {
													if (!prev) return prev;
													return { ...prev, name: e.target.value };
												})
											}
											onKeyDown={(e) => {
												if (e.key === "Enter")
													endEditingPurchaserName("create");
											}}
										/>
									</TableCell>
									<TableCell>
										<Button
											size="icon"
											onClick={() => endEditingPurchaserName("create")}
											disabled={!inputPurchaser.name}
										>
											<Check className="h-4 w-4" />
										</Button>
									</TableCell>
									<TableCell>
										<Button
											variant="outline"
											size="icon"
											onClick={() => setInputPurchaser(undefined)}
										>
											<X className="h-4 w-4" />
										</Button>
									</TableCell>
								</>
							) : (
								<TableCell>
									<Button
										variant="outline"
										onClick={() =>
											setInputPurchaser({ id: undefined, name: "" })
										}
										disabled={inputPurchaser !== undefined}
									>
										追加
									</Button>
								</TableCell>
							)}
						</TableRow>
					</TableFooter>
				</Table>
				<DialogFooter>
					<DialogClose asChild>
						<Button
							type="button"
							variant="outline"
							onClick={() => setInputPurchaser(undefined)}
						>
							閉じる
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

type ClientFormProps = {
	initialPurchasers: {
		id: number;
		name: string;
	}[];
};

const purchaseSchema = z.object({
	title: z.string().min(1, { message: "必須" }),
	date: z.date().optional(),
	note: z.string().optional(),
	purchasersAmountPaid: z.array(
		z.object({
			amountPaid: z.union([
				z
					.number({ message: "数字じゃないとダメ" })
					.nonnegative({ message: "0以上の値じゃないとダメ" })
					.int({ message: "整数じゃないとダメ" }),
				z.string().length(0, { message: "数字じゃないとダメ" }),
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
});

export const usePurchaseForm = (
	initialPurchasers: ClientFormProps["initialPurchasers"],
	purchaseIdForUpdate?: number,
	formDefaultValues?: Required<
		Parameters<typeof useForm<z.infer<typeof purchaseSchema>>>
	>[0]["defaultValues"],
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
				queryKey: ["purchases", "unsettled"],
			});
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
				purchaserNames.data?.map((x) => ({ amountPaid: 0 })) ?? [],
			purchasersAmountToPay:
				purchaserNames.data?.map((x) => ({ amountToPay: 0 })) ?? [],
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

	const calculateAmountToPay = (amountPaidSum: number) => {
		const dividedEquallyPurchasersAmountToPay = watchedPurchasersAmountPaid.map(
			(x) => ({
				amountToPay: amountPaidSum / watchedPurchasersAmountPaid.length,
			}),
		);

		purchasersAmountToPayReplace(dividedEquallyPurchasersAmountToPay);
	};

	const watchedPurchasersAmountPaid = form.watch("purchasersAmountPaid");

	return {
		purchasersCache,
		purchaserNames,
		form,
		purchasersAmountPaidFields,
		purchasersAmountToPayFields,
		handleSubmitCreate,
		handleSubmitUpdate,
		calculateAmountToPay,
		watchedPurchasersAmountPaid,
	};
};

export const ClientForm = ({ initialPurchasers }: ClientFormProps) => {
	const [equallyDivideCheckIsChecked, setEquallyDivideCheckIsChecked] =
		useState(false);

	const {
		purchasersCache,
		purchaserNames,
		form,
		purchasersAmountPaidFields,
		purchasersAmountToPayFields,
		handleSubmitCreate,
		calculateAmountToPay,
		watchedPurchasersAmountPaid,
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
							<Popover>
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
										onSelect={field.onChange}
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

				<ClientPurchasersDialog initialPurchasers={purchasersCache.data} />

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
										<li key={item.id}>
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

																	calculateAmountToPay(amountPaidSum);
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
										if (equallyDivideCheckIsChecked) return;

										const amountPaidSum = watchedPurchasersAmountPaid.reduce(
											(accumulator, currentValue) => {
												return (
													accumulator + Number(currentValue.amountPaid ?? 0)
												);
											},
											0,
										);

										calculateAmountToPay(amountPaidSum);
										setEquallyDivideCheckIsChecked((prev) => !prev);
									}}
									checked={equallyDivideCheckIsChecked}
								/>
								<Label htmlFor="equallyDivideCheck">等分</Label>

								<ul>
									{purchasersAmountToPayFields.map((item, index) => (
										<li key={item.id}>
											<FormField
												control={form.control}
												name={`purchasersAmountToPay.${index}.amountToPay`}
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
