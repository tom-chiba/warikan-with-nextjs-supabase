import type { ComponentProps } from "react";

type InputProps = Pick<
	ComponentProps<"input">,
	"id" | "name" | "type" | "defaultValue"
>;

const Input = (props: InputProps) => {
	return (
		<input {...props} className="text-black border border-gray-300 shadow" />
	);
};
export default Input;
