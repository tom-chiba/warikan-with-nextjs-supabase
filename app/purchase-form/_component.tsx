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
  purchasers: (Database["public"]["Tables"]["purchasers"]["Row"] & {
    amountPaid: number | null;
    amountToPay: number | null;
  })[];
};

export const Form = () => {
  const componentId = useId();

  const supabase = createClient();

  const zodSchema = z.object<toZod<FormItems>>({
    title: z.string().min(1, { message: "必須" }),
    date: z.string(),
    note: z.string(),
    purchasers: z.array(
      z.object({
        created_at: z.string(),
        id: z.number(),
        name: z.string(),
        user_id: z.string(),
        amountPaid: z
          .number()
          .nonnegative({ message: "0以上の値じゃないとダメ" })
          .int({ message: "正数じゃないとダメ" })
          .nullable(),
        amountToPay: z
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
    fields: purchasersFields,
    append: purchasersAppend,
    remove: purchasersRemove,
  } = useFieldArray({
    control,
    name: "purchasers",
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
      purchasersAppend({ ...x, amountPaid: null, amountToPay: null });
    });

    return () => {
      purchasersRemove(purchasers.map((_, i) => i));
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
          {purchasersFields.map((field, index) => (
            <Fragment key={field.id}>
              <label htmlFor={field.id}>{field.name}</label>
              <input
                key={field.id}
                id={field.id}
                className="text-black"
                {...register(`purchasers.${index}.amountPaid`, {
                  valueAsNumber: true,
                })}
              />
              {formStateErrors.purchasers?.[index]?.amountPaid?.message && (
                <p>
                  {formStateErrors.purchasers?.[index]?.amountPaid?.message}
                </p>
              )}
            </Fragment>
          ))}
        </div>
      </div>
      <div>
        <span>割勘金額</span>
        <div>
          {purchasersFields.map((field, index) => (
            <Fragment key={field.id}>
              <label htmlFor={field.id}>{field.name}</label>
              <input
                key={field.id}
                id={field.id}
                className="text-black"
                {...register(`purchasers.${index}.amountToPay`, {
                  valueAsNumber: true,
                })}
              />
              {formStateErrors.purchasers?.[index]?.amountToPay?.message && (
                <p>
                  {formStateErrors.purchasers?.[index]?.amountToPay?.message}
                </p>
              )}
            </Fragment>
          ))}
        </div>
      </div>
      <button type="submit">追加</button>
    </form>
  );
};
