import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { server } from "../mocks/node";

process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

export const user = userEvent.setup();

export const TSQWrapper = ({ children }: { children: ReactNode }) => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: Number.POSITIVE_INFINITY,
				retry: false,
			},
		},
	});
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
};

afterAll(() => server.close());
beforeAll(() => server.listen());
afterEach(() => {
	server.resetHandlers();
	cleanup();
});
