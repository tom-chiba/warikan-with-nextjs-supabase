"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/utils/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ellipsis } from "lucide-react";
import Link from "next/link";

type ClientControlMenuProps = {
	purchaseId: number;
};

const ClientControlMenu = ({ purchaseId }: ClientControlMenuProps) => {
	const supabase = createClient();
	const queryClient = useQueryClient();

	const deletePurchaseMutation = useMutation({
		mutationFn: async (purchaseId: number) => {
			const { error } = await supabase
				.from("purchases")
				.delete()
				.eq("id", purchaseId);
			if (error) throw new Error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["purchases"] });
		},
	});
	const settlePurchaseMutation = useMutation({
		mutationFn: async (purchaseId: number) => {
			const { error } = await supabase
				.from("purchases")
				.update({ is_settled: true })
				.eq("id", purchaseId)
				.select();
			if (error) throw new Error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["purchases"] });
		},
	});

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Ellipsis />
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem
					className="h-12"
					onClick={() => settlePurchaseMutation.mutate(purchaseId)}
				>
					精算
				</DropdownMenuItem>
				<Link href={`/purchase/${purchaseId}/edit`}>
					<DropdownMenuItem className="h-12">編集</DropdownMenuItem>
				</Link>
				<DropdownMenuItem
					className="h-12"
					onClick={() => deletePurchaseMutation.mutate(purchaseId)}
				>
					削除
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
export default ClientControlMenu;
