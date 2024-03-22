"use server";

import { createClient } from "@/utils/supabase/server";
import { parseWithZod } from "@conform-to/zod";
import { purchaserSchema } from "./_components";

export const createPurchaser = async (_: unknown, formData: FormData) => {
	const supabase = createClient();

	const submission = parseWithZod(formData, {
		schema: purchaserSchema,
	});

	if (submission.status !== "success") {
		return submission.reply();
	}

	const { error } = await supabase
		.from("purchasers")
		.insert([{ name: submission.value.name }])
		.select();
	if (error) {
		return submission.reply({
			formErrors: [error.message],
		});
	}
};
