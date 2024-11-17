"use client";

import Loader from "@/components/clients/Loader";
import {
	QueryClient,
	QueryClientProvider,
	isServer,
	useIsMutating,
} from "@tanstack/react-query";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import type { ReactNode } from "react";

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// With SSR, we usually want to set some default staleTime
				// above 0 to avoid refetching immediately on the client
				staleTime: 60 * 1000,
			},
		},
	});
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
	if (isServer) return makeQueryClient();

	if (!browserQueryClient) browserQueryClient = makeQueryClient();
	return browserQueryClient;
}

function Child({ children }: { children: ReactNode }) {
	const isMutating = useIsMutating();

	return (
		<>
			{children}
			<Loader isLoading={!!isMutating} />
		</>
	);
}

export function Providers(props: { children: ReactNode }) {
	const queryClient = getQueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			<ReactQueryStreamedHydration>
				<Child>{props.children}</Child>
			</ReactQueryStreamedHydration>
		</QueryClientProvider>
	);
}
