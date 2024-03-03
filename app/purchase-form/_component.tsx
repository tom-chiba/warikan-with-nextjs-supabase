"use client";

import { Database } from "@/database.types";
import { createClient } from "@/utils/supabase/client";
import { Fragment, useEffect, useId, useState } from "react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type toZod<T extends Record<string, any>> = {
  [K in keyof T]-?: z.ZodType<T[K]>;
};

type FormItems = {
  title: string;
  date: string;
  note: string;
  paidList: (Database["public"]["Tables"]["purchasers"]["Row"] & {
    amount: number | null;
  })[];
  toPayList: (Database["public"]["Tables"]["purchasers"]["Row"] & {
    amount: number | null;
  })[];
};

export const Form = () => {
  const componentId = useId();

  const supabase = createClient();

  const zodSchema = z.object<toZod<FormItems>>({
    title: z.string().min(1, { message: "必須" }),
    date: z.string(),
    note: z.string(),
    paidList: z.array(
      z.object({
        created_at: z.string(),
        id: z.number(),
        name: z.string(),
        user_id: z.string(),
        amount: z
          .number()
          .nonnegative({ message: "0以上の値じゃないとダメ" })
          .int({ message: "正数じゃないとダメ" })
          .nullable(),
      })
    ),
    toPayList: z.array(
      z.object({
        created_at: z.string(),
        id: z.number(),
        name: z.string(),
        user_id: z.string(),
        amount: z
          .number()
          .nonnegative({ message: "0以上の値じゃないとダメ" })
          .int({ message: "正数じゃないとダメ" })
          .nullable(),
      })
    ),
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors: formStateErrors },
  } = useForm<FormItems>({
    resolver: zodResolver(zodSchema),
  });
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

  const onSubmit: SubmitHandler<FormItems> = (e) => console.dir(e);

  useEffect(() => {
    readPurchaser();
  }, []);

  useEffect(() => {
    if (!purchasers) return;

    purchasers.forEach((x) => {
      paidListAppend({ ...x, amount: null });
      toPayListAppend({ ...x, amount: null });
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
        {formStateErrors.title?.message && (
          <p className="text-white">{formStateErrors.title?.message}</p>
        )}
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
                {...register(`paidList.${index}.amount`, {
                  valueAsNumber: true,
                })}
              />
              {formStateErrors.paidList?.[index]?.amount?.message && (
                <p>{formStateErrors.paidList?.[index]?.amount?.message}</p>
              )}
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
                {...register(`toPayList.${index}.amount`, {
                  valueAsNumber: true,
                })}
              />
              {formStateErrors.toPayList?.[index]?.amount?.message && (
                <p>{formStateErrors.toPayList?.[index]?.amount?.message}</p>
              )}
            </Fragment>
          ))}
        </div>
      </div>
      <button type="submit">追加</button>
    </form>
  );
};
