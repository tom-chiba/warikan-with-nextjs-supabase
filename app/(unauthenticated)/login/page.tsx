"use client";
import Loader from "@/components/clients/Loader";
import { useTransition } from "react";
import { signIn, signUp } from "./serverActions";

export default function Login({
	searchParams,
}: {
	searchParams: { message: string };
}) {
	const [isPending, startTransition] = useTransition();

	const handleSignIn = async (formData: FormData) => {
		startTransition(() => {
			signIn(formData);
		});
	};
	const handleSignUp = async (formData: FormData) => {
		startTransition(() => {
			signUp(formData);
		});
	};

	return (
		<div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
			<form
				className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
				action={handleSignIn}
			>
				<label className="text-md" htmlFor="email">
					Email
				</label>
				<input
					className="rounded-md px-4 py-2 bg-inherit border mb-6"
					name="email"
					placeholder="you@example.com"
					required
				/>
				<label className="text-md" htmlFor="password">
					Password
				</label>
				<input
					className="rounded-md px-4 py-2 bg-inherit border mb-6"
					type="password"
					name="password"
					placeholder="••••••••"
					required
				/>
				<button
					type="submit"
					className="bg-green-700 rounded-md px-4 py-2 text-foreground mb-2"
				>
					Sign In
				</button>
				<button
					type="submit"
					formAction={handleSignUp}
					className="border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2"
				>
					Sign Up
				</button>
				{searchParams?.message && (
					<p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
						{searchParams.message}
					</p>
				)}
			</form>
			<Loader isLoading={isPending} />
		</div>
	);
}
