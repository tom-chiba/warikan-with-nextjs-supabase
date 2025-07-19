import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import PurchaseEditForm from "./PurchaseEditForm";

type PurchaseEditPageProps = {
	params: {
		id: string;
	};
};

const PurchaseEditPage = async ({ params }: PurchaseEditPageProps) => {
	const supabase = createClient();
	const purchaseId = Number(params.id);

	if (Number.isNaN(purchaseId)) {
		notFound();
	}

	const { data: purchaseData, error: purchaseError } = await supabase
		.from("purchases")
		.select(
			`
      title,
      purchase_date,
      note,
      purchasers_purchases ( id, purchaser_id, amount_paid, amount_to_pay )
    `,
		)
		.eq("id", purchaseId)
		.single();

	if (purchaseError || !purchaseData) {
		notFound();
	}

	const { data: purchasers, error: purchasersError } = await supabase
		.from("purchasers")
		.select("id, name")
		.order("created_at", { ascending: true });

	if (purchasersError) {
		// TODO: エラーハンドリング
		console.error(purchasersError);
		return <p>Error</p>;
	}

	const initialPurchase = {
		title: purchaseData.title,
		date: purchaseData.purchase_date
			? new Date(purchaseData.purchase_date)
			: undefined,
		note: purchaseData.note,
		purchasersAmountPaid: purchaseData.purchasers_purchases.map((p) => ({
			amountPaid: p.amount_paid ?? 0,
		})),
		purchasersAmountToPay: purchaseData.purchasers_purchases.map((p) => ({
			amountToPay: p.amount_to_pay ?? 0,
		})),
	};

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4">購入品編集ページ</h1>
			<PurchaseEditForm
				purchaseId={purchaseId}
				initialPurchasers={purchasers}
				initialPurchase={initialPurchase}
			/>
		</div>
	);
};

export default PurchaseEditPage;
