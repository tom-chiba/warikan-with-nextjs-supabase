import NodataMessage from "@/components/NodataMessage";
import { createClient } from "@/utils/supabase/server";
import ClientForm from "./ClientForm";

const ServerForm = async () => {
	const supabase = createClient();

	const { data: purchasers, error } = await supabase
		.from("purchasers")
		.select("id, name")
		.order("created_at", { ascending: true });
	if (error) throw new Error(error.message);

	if (!purchasers) return <NodataMessage />;

	return <ClientForm initialPurchasers={purchasers} />;
};
export default ServerForm;
