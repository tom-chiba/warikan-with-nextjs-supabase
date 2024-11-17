'use client';

import { useEffect } from "react";
import styles from "./index.module.css";

type Props = {
	isLoading: boolean;
};

const Loader = ({ isLoading }: Props) => {
	useEffect(() => {
		if (isLoading) {
			document.body.setAttribute("inert", "");
		}

		return () => {
			document.body.removeAttribute("inert");
		};
	}, [isLoading]);

	if (!isLoading) return null;

	return (
		<div
			className={
				"fixed top-0 left-0 flex justify-center items-center w-full h-full bg-white bg-opacity-50"
			}
		>
			<div
				className={`${styles.loader} w-12 p-2 aspect-square rounded-full bg-green-700`}
			/>
		</div>
	);
};
export default Loader;
