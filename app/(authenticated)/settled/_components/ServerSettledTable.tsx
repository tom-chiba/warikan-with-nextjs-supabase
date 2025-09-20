import NodataMessage from "@/components/NodataMessage";
import { createClient } from "@/utils/supabase/server";
import ClientSettledTable from "./ClientSettledTable";

const ServerSettledTable = async () => {
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
		.eq("is_settled", true)
		.order("purchase_date", { ascending: false });

	const { data: purchasersData, error: purchasersError } = await supabase
		.from("purchasers")
		.select("id, name")
		.order("created_at", { ascending: true });

	if (purchasesError) throw new Error(purchasesError.message);
	if (purchasersError) throw new Error(purchasersError.message);

	if (!purchasesData) return <NodataMessage />;
	if (!purchasersData) return <NodataMessage />;

	return (
		<ClientSettledTable
			initialPurchases={purchasesData}
			initialPurchasers={purchasersData}
		/>
	);
};
export default ServerSettledTable;
