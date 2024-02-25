"use client";

import { Database } from "@/database.types";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useId, useRef, useState } from "react";

export const Form = () => {
  const componentId = useId();
  const purchaserNameRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const createPurchaser = async () => {
    const { error } = await supabase
      .from("purchasers")
      .insert([{ name: purchaserNameRef.current?.value ?? "" }])
      .select();
    if (error) {
      console.error(error);
    }
  };

  return (
    <form
      action={() => {
        createPurchaser();
      }}
    >
      <label htmlFor={`${componentId}-purchaserName`}>追加する購入者名</label>
      <input
        ref={purchaserNameRef}
        id={`${componentId}-purchaserName`}
        type="text"
        className="text-black"
      />
      <button type="submit">追加</button>
    </form>
  );
};

export const Table = () => {
  const supabase = createClient();

  const [purchasers, setPurchasers] = useState<
    Database["public"]["Tables"]["purchasers"]["Row"][] | null
  >([]);

  const readPurchaser = async () => {
    let { data: purchasers, error } = await supabase
      .from("purchasers")
      .select("*");
    if (error) {
      console.error(error);
      return;
    }
    setPurchasers(purchasers);
  };

  useEffect(() => {
    readPurchaser();
  }, []);

  return (
    <div>
      <span>リロードしないと購入者名は更新されないので注意</span>
      <table>
        <thead>
          <tr>
            <th>購入者名</th>
            <th>削除</th>
            <th>編集</th>
          </tr>
        </thead>
        <tbody>
          {purchasers?.map((x) => (
            <tr key={x.id}>
              <td>{x.name}</td>
              <td>削除ボタン</td>
              <td>編集ボタン</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul></ul>
    </div>
  );
};
