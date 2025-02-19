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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Ellipsis } from "lucide-react";
import { useState } from "react";
import usePurchaseForm from "../../_hooks/usePurchaseForm";

type ClientControlMenuProps = {
	initialPurchasers: Parameters<typeof usePurchaseForm>[0];
	purchaseId: Parameters<typeof usePurchaseForm>[1];
	purchase: Parameters<typeof usePurchaseForm>[2];
};
// ドロップダウンメニューごとダイアログ化する必要あり(参考→https://ui.shadcn.com/docs/components/dialog)
const ClientControlMenu = ({
	initialPurchasers,
	purchaseId,
	purchase,
}: ClientControlMenuProps) => {
	const supabase = createClient();
	const queryClient = useQueryClient();

	const [dialogIsOpen, setDialogIsOpen] = useState(false);
	const [dateInputPopoverIsOpen, setDateInputPopoverIsOpen] = useState(false);

	const {
		calculateDistributeRemainderRandomly,
		form,
		handleSubmitUpdate,
		purchaserNames,
		purchasersAmountPaidFields,
		purchasersAmountToPayFields,
		watchedPurchasersAmountPaid,
		purchasersAmountPaidSum,
	} = usePurchaseForm(initialPurchasers, purchaseId, purchase, () => {
		setDialogIsOpen(false);
	});

	const [equallyDivideCheckIsChecked, setEquallyDivideCheckIsChecked] =
		useState(false);

	const deletePurchaseMutation = useMutation({
		mutationFn: async (purchaseId: number) => {
			const { error } = await supabase
				.from("purchases")
				.delete()
				.eq("id", purchaseId);
			if (error) throw new Error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["purchases"] });
		},
	});
	const settlePurchaseMutation = useMutation({
		mutationFn: async (purchaseId: number) => {
			const { error } = await supabase
				.from("purchases")
				.update({ is_settled: true })
				.eq("id", purchaseId)
				.select();
			if (error) throw new Error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["purchases"] });
		},
	});

	return (
		<Dialog open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
			<DropdownMenu>
				<DropdownMenuTrigger>
					<Ellipsis />
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem
						className="h-12"
						onClick={() =>
							purchaseId && settlePurchaseMutation.mutate(purchaseId)
						}
					>
						精算
					</DropdownMenuItem>
					<DialogTrigger onClick={() => setDialogIsOpen(true)} asChild>
						<DropdownMenuItem className="h-12">編集</DropdownMenuItem>
					</DialogTrigger>
					<DropdownMenuItem
						className="h-12"
						onClick={() =>
							purchaseId && deletePurchaseMutation.mutate(purchaseId)
						}
					>
						削除
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>購入品情報編集</DialogTitle>
				</DialogHeader>
				<div className="overflow-auto h-96 px-1">
					<Form {...form}>
						<form
							id="purchaseUpdateForm"
							onSubmit={form.handleSubmit(handleSubmitUpdate)}
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
													<li key={item.id}>
														<FormField
															control={form.control}
															name={`purchasersAmountPaid.${index}.amountPaid`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>
																		{purchaserNames.data[index]}
																	</FormLabel>
																	<FormControl>
																		<Input
																			{...field}
																			onChange={(e) => {
																				const inputValue = e.target.value;
																				const inputValueAsNumber =
																					Number(inputValue);
																				if (
																					!inputValue ||
																					Number.isNaN(inputValueAsNumber)
																				)
																					field.onChange(inputValue);
																				else field.onChange(inputValueAsNumber);

																				if (!equallyDivideCheckIsChecked)
																					return;

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
																								Number(
																									currentValue.amountPaid ?? 0,
																								)
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

													const amountPaidSum =
														watchedPurchasersAmountPaid.reduce(
															(accumulator, currentValue) => {
																return (
																	accumulator +
																	Number(currentValue.amountPaid ?? 0)
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
																				const inputValueAsNumber =
																					Number(inputValue);
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
						</form>
					</Form>
				</div>
				<DialogFooter>
					<Button type="submit" form="purchaseUpdateForm">
						OK
					</Button>
					<DialogClose asChild>
						<Button
							type="button"
							onClick={() => {
								form.reset();
								setDialogIsOpen(false);
							}}
						>
							キャンセル
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
export default ClientControlMenu;
