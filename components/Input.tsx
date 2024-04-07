import type { ComponentProps } from "react";

type InputProps = Pick<
	ComponentProps<"input">,
	"id" | "name" | "type" | "defaultValue"
> & {
	size?: "small" | "medium";
};

const Input = ({ size, ...inputProps }: InputProps) => {
	return (
		<input
			{...inputProps}
			className={`${
				size === "small" ? "w-24 " : ""
			}text-black border border-gray-300 shadow`}
		/>
	);
};
export default Input;
