"use client";

import {
	isServer,
	QueryClient,
	QueryClientProvider,
	useIsMutating,
} from "@tanstack/react-query";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import type { ReactNode } from "react";
import LoaderWithInert from "@/components/clients/LoaderWithInert";

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

let browserQueryClient: QueryClient | undefined;

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
			{!!isMutating && <LoaderWithInert />}
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
