import { z } from "zod";

export const purchaserSchema = z.object({
	name: z.string().min(1),
});
