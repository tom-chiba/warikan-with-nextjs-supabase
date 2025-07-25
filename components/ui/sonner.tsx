"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

type SonnerTheme = NonNullable<ToasterProps["theme"]>

const isSonnerTheme = (theme: string): theme is SonnerTheme => {
	return ["light", "dark", "system"].includes(theme)
}

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme()

	const sonnerTheme: SonnerTheme = isSonnerTheme(theme) ? theme : "system"

	return (
		<Sonner
			theme={sonnerTheme}
			className="toaster group"
			toastOptions={{
				classNames: {
					toast:
						"group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
					description: "group-[.toast]:text-muted-foreground",
					actionButton:
						"group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
					cancelButton:
						"group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
				},
			}}
			closeButton
			{...props}
		/>
	)
}

export { Toaster }
