"use client";

import { Fragment, useEffect, useId } from "react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";

const dummyPeople = [
  { id: 0, name: "太郎" },
  { id: 1, name: "次郎" },
  { id: 2, name: "三郎" },
];

type FormItem = {
  title: string;
  date: string;
  note: string;
  paidList: ((typeof dummyPeople)[number] & { amount: number })[];
  toPayList: ((typeof dummyPeople)[number] & { amount: number })[];
};

export const Form = () => {
  const componentId = useId();

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

  const onSubmit: SubmitHandler<FormItem> = (e) => console.dir(e);

  useEffect(() => {
    dummyPeople.forEach((x) => {
      paidListAppend({ ...x, amount: 0 });
      toPayListAppend({ ...x, amount: 0 });
    });

    return () => {
      paidListRemove(dummyPeople.map((_, i) => i));
      toPayListRemove(dummyPeople.map((_, i) => i));
    };
  }, [dummyPeople]);

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
