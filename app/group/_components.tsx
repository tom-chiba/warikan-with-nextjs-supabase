"use client";

import { createClient } from "@/utils/supabase/client";
import { useId, useRef } from "react";

export const Form = () => {
  const componentId = useId();
  const groupNameRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const createGroup = async () => {
    const { data, error } = await supabase
      .from("groups")
      .insert([{ name: groupNameRef.current?.value ?? "" }])
      .select();
    if (error) {
      console.error(error);
    } else {
      const insertedGroup = data.at(-1);
      if (!insertedGroup) return;

      const { error } = await supabase
        .from("groups_users")
        .insert([{ group_id: insertedGroup.id }])
        .select();
      if (error) {
        console.error(error);
      }
    }
  };

  return (
    <form
      action={() => {
        createGroup();
      }}
    >
      <label htmlFor={`${componentId}-groupName`}>追加するグループ名</label>
      <input
        ref={groupNameRef}
        id={`${componentId}-groupName`}
        type="text"
        className="text-black"
      />
      <button type="submit">追加</button>
    </form>
  );
};
