"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/utils/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ellipsis, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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
		onError: () => {
			toast.error("削除に失敗しました");
		},
	});
	const unsettlePurchaseMutation = useMutation({
		mutationFn: async (purchaseId: number) => {
			const { error } = await supabase
				.from("purchases")
				.update({ is_settled: false })
				.eq("id", purchaseId)
				.select();
			if (error) throw new Error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["purchases"] });
		},
		onError: () => {
			toast.error("未精算への変更に失敗しました");
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
					onClick={() => unsettlePurchaseMutation.mutate(purchaseId)}
					disabled={unsettlePurchaseMutation.isPending}
				>
					{unsettlePurchaseMutation.isPending ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						"未精算"
					)}
				</DropdownMenuItem>
				<Link href={`/purchase/${purchaseId}/edit`}>
					<DropdownMenuItem className="h-12">編集</DropdownMenuItem>
				</Link>
				<DropdownMenuItem
					className="h-12"
					onClick={() => deletePurchaseMutation.mutate(purchaseId)}
					disabled={deletePurchaseMutation.isPending}
				>
					{deletePurchaseMutation.isPending ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						"削除"
					)}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
export default ClientControlMenu;
