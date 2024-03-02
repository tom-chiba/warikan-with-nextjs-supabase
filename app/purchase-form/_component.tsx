"use client";

import { Database } from "@/database.types";
import { createClient } from "@/utils/supabase/client";
import { Fragment, useEffect, useId, useState } from "react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";

type FormItem = {
  title: string;
  date: string;
  note: string;
  paidList: (Database["public"]["Tables"]["purchasers"]["Row"] & {
    amount: number;
  })[];
  toPayList: (Database["public"]["Tables"]["purchasers"]["Row"] & {
    amount: number;
  })[];
};

export const Form = () => {
  const componentId = useId();

  const supabase = createClient();

  const { control, register, handleSubmit } = useForm<FormItem>();
  const {
    fields: paidListFields,
    append: paidListAppend,
    remove: paidListRemove,
  } = useFieldArray({
    control,
    name: "paidList",
  });
  const {
    fields: toPayListFields,
    append: toPayListAppend,
    remove: toPayListRemove,
  } = useFieldArray({
    control,
    name: "toPayList",
  });

  const [purchasers, setPurchasers] = useState<
    Database["public"]["Tables"]["purchasers"]["Row"][] | null
  >(null);

  const readPurchaser = async () => {
    let { data, error } = await supabase
      .from("purchasers")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      console.error(error);
      return;
    }
    setPurchasers(data);
  };

  const onSubmit: SubmitHandler<FormItem> = (e) => console.dir(e);

  useEffect(() => {
    readPurchaser();
  }, []);

  useEffect(() => {
    if (!purchasers) return;

    purchasers.forEach((x) => {
      paidListAppend({ ...x, amount: 0 });
      toPayListAppend({ ...x, amount: 0 });
    });

    return () => {
      paidListRemove(purchasers.map((_, i) => i));
      toPayListRemove(purchasers.map((_, i) => i));
    };
  }, [purchasers]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor={`${componentId}-title`}>購入品名</label>
        <input
          id={`${componentId}-title`}
          className="text-black"
          {...register("title")}
        />
      </div>
      <div>
        <label htmlFor={`${componentId}-date`}>購入日</label>
        <input
          id={`${componentId}-date`}
          type="date"
          className="text-black"
          {...register("date")}
        />
      </div>
      <div>
        <label htmlFor={`${componentId}-note`}>メモ</label>
        <input
          id={`${componentId}-note`}
          className="text-black"
          {...register("note")}
        />
      </div>
      <div>
        <span>支払額</span>
        <div>
          {paidListFields.map((field, index) => (
            <Fragment key={field.id}>
              <label htmlFor={field.id}>{field.name}</label>
              <input
                key={field.id}
                id={field.id}
                className="text-black"
                {...register(`paidList.${index}.amount`)}
              />
            </Fragment>
          ))}
        </div>
      </div>
      <div>
        <span>割勘金額</span>
        <div>
          {toPayListFields.map((field, index) => (
            <Fragment key={field.id}>
              <label htmlFor={field.id}>{field.name}</label>
              <input
                key={field.id}
                id={field.id}
                className="text-black"
                {...register(`toPayList.${index}.amount`)}
              />
            </Fragment>
          ))}
        </div>
      </div>
      <button type="submit">追加</button>
    </form>
  );
};
