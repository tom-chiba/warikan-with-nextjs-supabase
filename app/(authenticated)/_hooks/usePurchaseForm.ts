import { createClient } from "@/utils/supabase/client";
import type { UseQueryDataAndStatus } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import type { ClientFormProps } from "../_components/ClientForm";

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

const usePurchaseForm = (
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
export default usePurchaseForm;
