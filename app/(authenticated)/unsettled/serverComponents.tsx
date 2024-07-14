import { createClient } from "@/utils/supabase/server";
import { ClientUnsettledBlock } from "./clientComponents";

export const ServerUnsettledBlock = async () => {
	const supabase = createClient();

	const { data: purchasers, error } = await supabase
		.from("purchasers")
		.select("id, name")
		.order("created_at", { ascending: true });

	if (error) return <span>error</span>;

	if (!purchasers) return <span>nodata</span>;

	return <ClientUnsettledBlock initialPurchasers={purchasers} />;
};
