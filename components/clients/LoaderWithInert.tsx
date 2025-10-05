"use client";

import Loader from "@/components/Loader";
import { useEffect } from "react";

const LoaderWithInert = () => {
	useEffect(() => {
		document.body.setAttribute("inert", "");
		return () => {
			document.body.removeAttribute("inert");
		};
	}, []);

	return <Loader />;
};

export default LoaderWithInert;
