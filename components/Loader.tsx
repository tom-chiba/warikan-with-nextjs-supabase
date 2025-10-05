import { cn } from "@/lib/utils";
import styles from "./Loader.module.css";

type LoaderProps = {
	className?: string;
};

const Loader = ({ className }: LoaderProps) => {
	return (
		<div
			aria-label="読み込み中"
			className={cn(
				"fixed top-0 left-0 flex justify-center items-center w-full h-full bg-white bg-opacity-50",
				className,
			)}
		>
			<div
				className={`${styles.loader} w-12 p-2 aspect-square rounded-full bg-green-700`}
			/>
		</div>
	);
};

export default Loader;
