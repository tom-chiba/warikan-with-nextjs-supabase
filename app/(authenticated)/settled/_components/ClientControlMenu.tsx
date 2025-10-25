"use client";

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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
import { useState } from "react";
import { toast } from "sonner";

type ClientControlMenuProps = {
	purchaseId: number;
	purchaseTitle?: string;
};

const ClientControlMenu = ({
	purchaseId,
	purchaseTitle,
}: ClientControlMenuProps) => {
	const supabase = createClient();
	const queryClient = useQueryClient();

	const [deleteTarget, setDeleteTarget] = useState<
		| {
				id: number;
				title: string;
		  }
		| undefined
	>();

	const deletePurchaseMutation = useMutation({
		mutationFn: async (purchaseId: number) => {
			const { error } = await supabase
				.from("purchases")
				.delete()
				.eq("id", purchaseId);
			if (error) throw new Error(error.message);
		},
		onSuccess: () => {
			setDeleteTarget(undefined);
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
		<>
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
							<Loader2
								className="h-4 w-4 animate-spin"
								aria-label="読み込み中"
							/>
						) : (
							"未精算"
						)}
					</DropdownMenuItem>
					<Link href={`/purchase/${purchaseId}/edit`}>
						<DropdownMenuItem className="h-12">編集</DropdownMenuItem>
					</Link>
					<DropdownMenuItem
						className="h-12"
						onClick={() =>
							setDeleteTarget({
								id: purchaseId,
								title: purchaseTitle || "この購入品",
							})
						}
						disabled={deletePurchaseMutation.isPending}
					>
						{deletePurchaseMutation.isPending ? (
							<Loader2
								className="h-4 w-4 animate-spin"
								aria-label="読み込み中"
							/>
						) : (
							"削除"
						)}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialog
				open={deleteTarget !== undefined}
				onOpenChange={(open) => {
					if (!open && !deletePurchaseMutation.isPending) {
						setDeleteTarget(undefined);
					}
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>購入品を削除</AlertDialogTitle>
						<AlertDialogDescription>
							「{deleteTarget?.title}
							」を削除しますか？この操作は取り消せません。
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deletePurchaseMutation.isPending}>
							キャンセル
						</AlertDialogCancel>
						<Button
							variant="destructive"
							onClick={() =>
								deleteTarget && deletePurchaseMutation.mutate(deleteTarget.id)
							}
							disabled={deletePurchaseMutation.isPending}
						>
							{deletePurchaseMutation.isPending ? (
								<Loader2
									className="h-4 w-4 animate-spin"
									aria-label="読み込み中"
								/>
							) : (
								"削除"
							)}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
export default ClientControlMenu;
