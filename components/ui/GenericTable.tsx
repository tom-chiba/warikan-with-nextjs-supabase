import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export type GenericTableColumn<T> = {
	header: React.ReactNode;
	cell: (row: T) => React.ReactNode;
	key: string;
};

export type GenericTableProps<T> = {
	columns: GenericTableColumn<T>[];
	data: T[];
	emptyMessage?: React.ReactNode;
};

export function GenericTable<T extends { id: number }>({
	columns,
	data,
	emptyMessage,
}: GenericTableProps<T>) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					{columns.map((col) => (
						<TableHead key={col.key}>{col.header}</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{data.length === 0 ? (
					<TableRow>
						<TableCell colSpan={columns.length} className="text-center">
							{emptyMessage || "データがありません"}
						</TableCell>
					</TableRow>
				) : (
					data.map((row) => (
						<TableRow key={row.id}>
							{columns.map((col) => (
								<TableCell key={col.key}>{col.cell(row)}</TableCell>
							))}
						</TableRow>
					))
				)}
			</TableBody>
		</Table>
	);
}
