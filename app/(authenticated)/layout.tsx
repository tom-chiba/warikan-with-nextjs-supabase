import AuthButton from "@/components/AuthButton";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Providers>
			<AuthButton />
			<Separator className="my-2" />
			{children}
			<Toaster />
		</Providers>
	);
}
