"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export const Table = () => {
  const supabase = createClient();

  const [purchases, setPurchases] = useState<
    | {
        id: number;
        title: string;
        date?: string;
        totalAmount: number;
      }[]
    | undefined
  >();

  const readPurchases = async () => {
    const { data: purchasesData, error: purchasesError } = await supabase
      .from("purchases")
      .select(
        `
        id,
        title,
        purchase_date,
        is_settled,
        purchasers_purchases ( id, amount_paid, amount_to_pay )
      `
      )
      .eq("is_settled", true)
      .order("created_at", { ascending: true });
    if (purchasesError) {
      console.error(purchasesError);
      return;
    }
    setPurchases(
      purchasesData.map((x) => ({
        id: x.id,
        title: x.title,
        date: x.purchase_date ?? undefined,
        totalAmount: x.purchasers_purchases.reduce(
          (previous, current) => previous + (current.amount_paid ?? 0),
          0
        ),
      }))
    );
  };

  const deletePurchaser = async (purchaseId: number) => {
    const { error } = await supabase
      .from("purchases")
      .delete()
      .eq("id", purchaseId);
    if (error) console.error(error);
    readPurchases();
  };

  const unsettlePurchase = async (purchaseId: number) => {
    const { error } = await supabase
      .from("purchases")
      .update({ is_settled: false })
      .eq("id", purchaseId)
      .select();
    if (error) console.error(error);
    readPurchases();
  };

  useEffect(() => {
    readPurchases();
  }, []);

  return (
    <>
      <p>削除後リロードしないと反映されません</p>
      <table>
        <thead>
          <tr>
            <th>購入品名</th>
            <th>購入日</th>
            <th>合計金額</th>
            <th>未精算</th>
            <th>削除</th>
          </tr>
        </thead>
        <tbody>
          {purchases?.map((x) => (
            <tr key={x.id}>
              <td>{x.title}</td>
              <td>{x.date}</td>
              <td>{x.totalAmount}</td>
              <td>
                <button
                  onClick={() => {
                    unsettlePurchase(x.id);
                  }}
                >
                  未精算
                </button>
              </td>
              <td>
                <button
                  onClick={() => {
                    deletePurchaser(x.id);
                  }}
                >
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
