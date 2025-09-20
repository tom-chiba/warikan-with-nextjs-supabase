"use client";

import Loader from "@/components/clients/Loader";
import { useTransition } from "react";
import { signIn, signUp } from "../serverActions";

type Props = {
	message?: string;
};

export default function ClientLoginForm({ message }: Props) {
	const [isPending, startTransition] = useTransition();

	const handleSignIn = (formData: FormData) => {
		startTransition(() => {
			signIn(formData);
		});
	};
	const handleSignUp = (formData: FormData) => {
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
					id="email"
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
					id="password"
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
				{message && (
					<p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
						{message}
					</p>
				)}
			</form>
			<Loader isLoading={isPending} />
		</div>
	);
}
