import type { Database } from "@/database.types";
import { http, HttpResponse, type PathParams } from "msw";

type Purchaser = Database["public"]["Tables"]["purchasers"]["Row"];
type PurchaserInsert = Database["public"]["Tables"]["purchasers"]["Insert"];

export const handlers = [
	http.get<PathParams, never, Purchaser[]>("*/rest/v1/purchasers*", () => {
		return HttpResponse.json([
			{
				id: 1,
				name: "John",
				created_at: new Date().toISOString(),
				user_id: "",
			},
			{
				id: 2,
				name: "Jane",
				created_at: new Date().toISOString(),
				user_id: "",
			},
		]);
	}),
	http.post<PathParams, PurchaserInsert, Purchaser>(
		"*/rest/v1/purchasers*",
		async ({ request }) => {
			const newPurchaser = await request.json();
			return HttpResponse.json({
				...newPurchaser,
				id: 3,
				created_at: new Date().toISOString(),
				user_id: "",
			});
		},
	),
	http.patch<PathParams, PurchaserInsert, Purchaser>(
		"*/rest/v1/purchasers*",
		async ({ request }) => {
			const updatedPurchaser = await request.json();
			return HttpResponse.json({
				...updatedPurchaser,
				id: 1,
				created_at: new Date().toISOString(),
				user_id: "",
			});
		},
	),
	http.delete("*/rest/v1/purchasers*", () => {
		return new HttpResponse(null, { status: 204 });
	}),
];
