import NodataMessage from "@/components/NodataMessage";
import { createClient } from "@/utils/supabase/server";
import ClientUnsettledBlock from "./ClientUnsettledBlock";

export const ServerUnsettledBlock = async () => {
	const supabase = await createClient();

	const { data: purchasesData, error: purchasesError } = await supabase
		.from("purchases")
		.select(
			`
				id,
				title,
				purchase_date,
				note,
				is_settled,
				purchasers_purchases ( id, purchaser_id, amount_paid, amount_to_pay )
			`,
		)
		.eq("is_settled", false)
		.order("purchase_date", { ascending: false });

	if (purchasesError) throw new Error(purchasesError.message);

	if (!purchasesData) return <NodataMessage />;

	return <ClientUnsettledBlock initialPurchases={purchasesData} />;
};
