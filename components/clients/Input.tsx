import { type ComponentProps, type ForwardedRef, forwardRef } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

type InputProps = UseFormRegisterReturn & {
	id?: string;
	type?: ComponentProps<"input">["type"];
};

const Input = (
	props: Omit<InputProps, "ref">,
	ref: ForwardedRef<HTMLInputElement>,
) => {
	return (
		<input
			{...props}
			ref={ref}
			className="text-black border border-gray-300 shadow"
		/>
	);
};
export default forwardRef(Input);
