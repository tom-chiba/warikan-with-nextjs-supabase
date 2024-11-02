import NodataMessage from "@/components/NodataMessage";
import { createClient } from "@/utils/supabase/server";
import { ClientUnsettledBlock } from "./clientComponents";

export const ServerUnsettledBlock = async () => {
	const supabase = createClient();

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
		.eq("is_settled", true)
		.order("created_at", { ascending: true });

	const { data: purchasersData, error: purchasersError } = await supabase
		.from("purchasers")
		.select("id, name")
		.order("created_at", { ascending: true });

	if (purchasesError) throw new Error(purchasesError.message);
	if (purchasersError) throw new Error(purchasersError.message);

	if (!purchasesData) return <NodataMessage />;
	if (!purchasersData) return <NodataMessage />;

	return (
		<ClientUnsettledBlock
			initialPurchases={purchasesData}
			initialPurchasers={purchasersData}
		/>
	);
};
