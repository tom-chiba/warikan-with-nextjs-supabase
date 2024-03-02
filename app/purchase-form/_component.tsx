"use client";

import { useId } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

type FormItem = {
  title: string;
  date: string;
  note: string;
};

export const Form = () => {
  const componentId = useId();

  const { register, handleSubmit } = useForm<FormItem>();

  const onSubmit: SubmitHandler<FormItem> = (e) => console.dir(e);

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
      <button type="submit">追加</button>
    </form>
  );
};
