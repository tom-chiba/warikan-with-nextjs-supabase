import AuthButton from "@/components/AuthButton";
import { Providers } from "./providers";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Providers>
			<AuthButton />
			{children}
		</Providers>
	);
}
