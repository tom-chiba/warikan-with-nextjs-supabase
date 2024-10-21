import { useQuery } from "@tanstack/react-query";

export type DistributivePick<T, K extends keyof T> = T extends unknown
		? Pick<T, K>
		: never;

export type UseQueryDataAndStatus<T> = DistributivePick<
		ReturnType<typeof useQuery<T>>,
		"data" | "status" | "isRefetching"
	>;