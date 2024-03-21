"use server";

import { createClient } from "@/utils/supabase/server";

export const createPurchaser = async (
	_: string | undefined,
	formData: FormData,
) => {
	const supabase = createClient();

	const name = formData.get("name");
	if (typeof name !== "string") return "購入者名がstringではありません。";

	const { error } = await supabase
		.from("purchasers")
		.insert([{ name }])
		.select();
	if (error) {
		return "APIリクエストに失敗しました。";
	}
};
