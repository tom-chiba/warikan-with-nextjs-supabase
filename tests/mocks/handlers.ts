import type { Database } from "@/database.types";
import { format, subDays } from "date-fns";
import { http, HttpResponse, type PathParams } from "msw";

type Purchaser = Database["public"]["Tables"]["purchasers"]["Row"];
type PurchaseWithPurchasersPurchases =
	Database["public"]["Tables"]["purchases"]["Row"] & {
		purchasers_purchases: Database["public"]["Tables"]["purchasers_purchases"]["Row"][];
	};

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
	http.get<PathParams, never, PurchaseWithPurchasersPurchases[]>(
		"*/rest/v1/purchases*",
		() => {
			return HttpResponse.json([
				{
					id: 1,
					title: "未精算購入1",
					purchase_date: format(new Date(), "yyyy-MM-dd"),
					note: "メモA",
					is_settled: false,
					created_at: new Date().toISOString(),
					user_id: "",
					purchasers_purchases: [
						{
							id: 1,
							purchase_id: 1,
							purchaser_id: 1,
							amount_paid: 1000,
							amount_to_pay: 500,
							created_at: new Date().toISOString(),
							user_id: "",
						},
						{
							id: 2,
							purchase_id: 1,
							purchaser_id: 2,
							amount_paid: 0,
							amount_to_pay: 500,
							created_at: new Date().toISOString(),
							user_id: "",
						},
					],
				},
				{
					id: 2,
					title: "未精算購入2",
					purchase_date: format(subDays(new Date(), 1), "yyyy-MM-dd"),
					note: "メモB",
					is_settled: false,
					created_at: new Date().toISOString(),
					user_id: "",
					purchasers_purchases: [
						{
							id: 3,
							purchase_id: 2,
							purchaser_id: 1,
							amount_paid: 500,
							amount_to_pay: 250,
							created_at: new Date().toISOString(),
							user_id: "",
						},
						{
							id: 4,
							purchase_id: 2,
							purchaser_id: 2,
							amount_paid: 0,
							amount_to_pay: 250,
							created_at: new Date().toISOString(),
							user_id: "",
						},
					],
				},
			]);
		},
	),
];
