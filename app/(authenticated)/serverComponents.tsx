import { createClient } from "@/utils/supabase/server";
import { ClientForm } from "./clientComponents";

export const ServerForm = async () => {
	const supabase = createClient();

	const { data: purchasers, error } = await supabase
		.from("purchasers")
		.select("id, name")
		.order("created_at", { ascending: true });

	if (error) return <span>error</span>;

	if (!purchasers) return <span>nodata</span>;

	return <ClientForm initialPurchasers={purchasers} />;
};
