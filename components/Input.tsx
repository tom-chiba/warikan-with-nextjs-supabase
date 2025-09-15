import { type ComponentProps, type ForwardedRef, forwardRef } from "react";

type InputProps = Pick<
	ComponentProps<"input">,
	"id" | "name" | "type" | "defaultValue" | "onChange"
> & {
	size?: "small" | "medium";
};

const Input = forwardRef(
	(
		{ size, ...inputProps }: InputProps,
		ref: ForwardedRef<HTMLInputElement>,
	) => {
		return (
			<input
				{...inputProps}
				className={`${
					size === "small" ? "w-24 " : ""
				}text-black border border-gray-300 shadow`}
				ref={ref}
			/>
		);
	},
);
export default Input;
