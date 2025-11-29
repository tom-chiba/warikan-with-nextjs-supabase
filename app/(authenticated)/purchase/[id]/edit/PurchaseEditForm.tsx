"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import usePurchaseForm from "@/app/(authenticated)/_hooks/usePurchaseForm";
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

type PurchaseEditFormProps = {
	purchaseId: number;
	initialPurchasers: Parameters<typeof usePurchaseForm>[0];
	initialPurchase: Parameters<typeof usePurchaseForm>[2];
};

const PurchaseEditForm = ({
	purchaseId,
	initialPurchasers,
	initialPurchase,
}: PurchaseEditFormProps) => {
	const router = useRouter();
	const [dateInputPopoverIsOpen, setDateInputPopoverIsOpen] = useState(false);
	const [equallyDivideCheckIsChecked, setEquallyDivideCheckIsChecked] =
		useState(false);

	const {
		calculateDistributeRemainderRandomly,
		form,
		handleSubmitUpdate,
		purchaserNames,
		purchasersAmountPaidFields,
		purchasersAmountToPayFields,
		watchedPurchasersAmountPaid,
		purchasersAmountPaidSum,
	} = usePurchaseForm(initialPurchasers, purchaseId, initialPurchase, () =>
		router.push("/unsettled"),
	);

	return (
		<Form {...form}>
			<form
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
																		field.onChange(inputValue);
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
				<Button type="submit">更新</Button>
			</form>
		</Form>
	);
};

export default PurchaseEditForm;
