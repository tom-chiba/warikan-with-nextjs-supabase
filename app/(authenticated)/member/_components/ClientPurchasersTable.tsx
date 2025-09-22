"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { createClient } from "@/utils/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Edit, Trash, X } from "lucide-react";
import { useState } from "react";

type ClientPurchasersTableProps = {
	initialPurchasers: {
		id: number;
		name: string;
	}[];
};
const ClientPurchasersTable = ({
	initialPurchasers,
}: ClientPurchasersTableProps) => {
	const [errorMessage, setErrorMessage] = useState<string | undefined>();
	const supabase = createClient();
	const queryClient = useQueryClient();

	const [inputPurchaser, setInputPurchaser] = useState<
		{ id: number | undefined; name: string } | undefined
	>(undefined);

	const purchasersCache = useQuery({
		queryKey: ["purchasers"],
		queryFn: async () => {
			const { data: purchasers, error } = await supabase
				.from("purchasers")
				.select("id, name")
				.order("created_at", { ascending: true });
			if (error) throw new Error(error.message);

			return purchasers;
		},
		initialData: initialPurchasers,
	});

	const createPurchaserMutation = useMutation({
		mutationFn: async (name: string) => {
			const { error } = await supabase
				.from("purchasers")
				.insert({ name })
				.select();
			if (error) throw new Error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["purchasers"] });
		},
	});

	const updatePurchaserMutation = useMutation({
		mutationFn: async ({ id, newName }: { id: number; newName: string }) => {
			const { data, error } = await supabase
				.from("purchasers")
				.update({ name: newName })
				.eq("id", id)
				.select();
			if (error) throw new Error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["purchasers"] });
		},
	});

	const deletePurchaserMutation = useMutation({
		mutationFn: async (id: number) => {
			const { error } = await supabase.from("purchasers").delete().eq("id", id);
			if (error) throw new Error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["purchasers"] });
		},
	});

	const endEditingPurchaserName = (mode: "create" | "update") => {
		if (!inputPurchaser) return;
		if (!inputPurchaser.name) return;
		setErrorMessage(undefined);
		switch (mode) {
			case "create": {
				const exists = purchasersCache.data.some(
					(p) => p.name === inputPurchaser.name,
				);
				if (exists) {
					setErrorMessage("同じ名前のメンバーが既に存在します");
					return;
				}
				createPurchaserMutation.mutate(inputPurchaser.name);
				break;
			}
			case "update": {
				if (!inputPurchaser.id) return;
				updatePurchaserMutation.mutate({
					id: inputPurchaser.id,
					newName: inputPurchaser.name,
				});
				break;
			}
		}
		setInputPurchaser(undefined);
	};

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-[200px]">名前</TableHead>
					<TableHead className="w-[20px]" />
					<TableHead className="w-[20px]" />
				</TableRow>
			</TableHeader>
			<TableBody>
				{purchasersCache.data.map((purchaser) => (
					<TableRow key={purchaser.name}>
						<TableCell className="font-medium">
							{inputPurchaser?.id === purchaser.id ? (
								<Input
									value={inputPurchaser.name}
									onChange={(e) =>
										setInputPurchaser((prev) => {
											if (!prev) return prev;
											return {
												...prev,
												name: e.target.value,
											};
										})
									}
									onKeyDown={(e) => {
										if (e.key === "Enter") endEditingPurchaserName("update");
									}}
								/>
							) : (
								<>{purchaser.name}</>
							)}
						</TableCell>

						<TableCell>
							{inputPurchaser?.id === purchaser.id ? (
								<Button
									size="icon"
									onClick={() => endEditingPurchaserName("update")}
									disabled={!inputPurchaser.name}
									aria-label="Save"
								>
									<Check className="h-4 w-4" />
								</Button>
							) : (
								<Button
									variant="outline"
									size="icon"
									onClick={() =>
										setInputPurchaser({
											id: purchaser.id,
											name: purchaser.name,
										})
									}
									disabled={inputPurchaser !== undefined}
									aria-label="Edit"
								>
									<Edit className="h-4 w-4" />
								</Button>
							)}
						</TableCell>

						<TableCell>
							{inputPurchaser?.id === purchaser.id ? (
								<Button
									variant="outline"
									size="icon"
									onClick={() => setInputPurchaser(undefined)}
									aria-label="Cancel"
								>
									<X className="h-4 w-4" />
								</Button>
							) : (
								<Button
									size="icon"
									onClick={() => deletePurchaserMutation.mutate(purchaser.id)}
									disabled={inputPurchaser !== undefined}
									aria-label="Delete"
								>
									<Trash className="h-4 w-4" />
								</Button>
							)}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
			<TableFooter>
				<TableRow>
					{inputPurchaser && inputPurchaser.id === undefined ? (
						<>
							<TableCell>
								<div>
									<Input
										value={inputPurchaser?.name}
										onChange={(e) =>
											setInputPurchaser((prev) => {
												if (!prev) return prev;
												return { ...prev, name: e.target.value };
											})
										}
										onKeyDown={(e) => {
											if (e.key === "Enter") endEditingPurchaserName("create");
										}}
									/>
									{errorMessage !== undefined && (
										<span className="text-red-500 text-xs mt-0.5">
											{errorMessage}
										</span>
									)}
								</div>
							</TableCell>
							<TableCell>
								<Button
									size="icon"
									onClick={() => endEditingPurchaserName("create")}
									disabled={!inputPurchaser.name}
									aria-label="Save"
								>
									<Check className="h-4 w-4" />
								</Button>
							</TableCell>
							<TableCell>
								<Button
									variant="outline"
									size="icon"
									onClick={() => setInputPurchaser(undefined)}
									aria-label="Cancel"
								>
									<X className="h-4 w-4" />
								</Button>
							</TableCell>
						</>
					) : (
						<TableCell>
							<Button
								variant="outline"
								onClick={() => setInputPurchaser({ id: undefined, name: "" })}
								disabled={inputPurchaser !== undefined}
							>
								追加
							</Button>
						</TableCell>
					)}
				</TableRow>
			</TableFooter>
		</Table>
	);
};
export default ClientPurchasersTable;
