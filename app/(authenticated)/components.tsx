import Link from "next/link";

type TabListProps = {
	tabItems: {
		label: string;
		href: string;
	}[];
};

export const TabList = ({ tabItems }: TabListProps) => {
	return (
		<ul className="flex border-b-2 border-b-blue-300 pb-1">
			{tabItems.map((x) => (
				<li className="border w-28 p-1" key={x.label}>
					<div className="border-b-2 border-b-blue-300 text-center">
						<Link className="" href={x.href}>
							{x.label}
						</Link>
					</div>
				</li>
			))}
		</ul>
	);
};
