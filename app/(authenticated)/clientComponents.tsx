"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { mdiAccountMinus, mdiAccountPlus, mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

type ClientPurchasersDialogProps = {
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
}: ClientPurchasersDialogProps) => {
	const supabase = createClient();
	const queryClient = useQueryClient();

	const dialogRef = useRef<HTMLDialogElement>(null);
	const [inputPurchaserName, setInputPurchaserName] = useState<
		string | undefined
	>();
	const [tempPurchasersToCreate, setTempPurchasersToCreate] = useState<
		| {
				id: string;
				name: string;
		  }[]
		| undefined
	>();
	const [purchasersIdToDelete, setPurchasersIdToDelete] = useState<
		(number | string)[] | undefined
	>();

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
		mutationFn: async () => {
			if (!tempPurchasersToCreate?.length) return;

			const { error } = await supabase
				.from("purchasers")
				.insert(
					tempPurchasersToCreate.map((purchaser) => ({ name: purchaser.name })),
				)
				.select();
			if (error) throw new Error(error.message);
		},
		onSuccess: () => {
			onCreate();
			setTempPurchasersToCreate(undefined);
		},
	});

	const deletePurchasersMutation = useMutation({
		mutationFn: async () => {
			if (!purchasersIdToDelete?.length) return;

			const { error } = await supabase
				.from("purchasers")
				.delete()
				.in("id", purchasersIdToDelete);
			if (error) throw new Error(error.message);
		},
		onSuccess: () => {
			onDelete();
			setPurchasersIdToDelete(undefined);
		},
	});

	const MemberLi = ({
		purchaser,
	}: {
		purchaser:
			| {
					id: number;
					name: string;
			  }
			| { id: string; name: string };
	}) => (
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
					{purchasersCache.data.map((purchaser) => (
						<MemberLi key={purchaser.id} purchaser={purchaser} />
					))}
					{tempPurchasersToCreate?.map((purchaser) => (
						<MemberLi key={purchaser.id} purchaser={purchaser} />
					))}
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
								await Promise.all([
									createPurchaserMutation.mutate(),
									deletePurchasersMutation.mutate(),
								]);
								queryClient.invalidateQueries({ queryKey: ["purchasers"] });
							})();
						}
						if (inputPurchaserName) {
							setTempPurchasersToCreate((prev) => [
								...(prev ?? []),
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

export const ClientForm = ({ initialPurchasers }: ClientFormProps) => {
	const supabase = createClient();
	const queryClient = useQueryClient();

	const [clientPurchasersDialogIsOpen, setClientPurchasersDialogIsOpen] =
		useState(false);
	const [equallyDivideCheckIsChecked, setEquallyDivideCheckIsChecked] =
		useState(false);

	type DistributivePick<T, K extends keyof T> = T extends unknown
		? Pick<T, K>
		: never;
	type UseQueryDataAndStatus<T> = DistributivePick<
		ReturnType<typeof useQuery<T>>,
		"data" | "status" | "isRefetching"
	>;

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
	const createPurchase = useMutation({
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
		defaultValues: {
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

	const handleSubmit = (values: z.infer<typeof purchaseSchema>) => {
		createPurchase.mutate(values);
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

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
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

				<Button onClick={() => setClientPurchasersDialogIsOpen(true)}>
					メンバー管理
				</Button>

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

				<ClientPurchasersDialog
					isOpen={clientPurchasersDialogIsOpen}
					onClose={() => setClientPurchasersDialogIsOpen(false)}
					initialPurchasers={purchasersCache.data}
					onCreate={() => {
						queryClient.invalidateQueries({ queryKey: ["purchasers"] });
					}}
					onDelete={() => {
						queryClient.invalidateQueries({ queryKey: ["purchasers"] });
					}}
				/>
			</form>
		</Form>
	);
};
