import ClientLoginForm from "./_components/ClientLoginForm";

export default async function Login({
	searchParams,
}: {
	searchParams: Promise<{ message: string }>;
}) {
	const { message } = await searchParams;
	return <ClientLoginForm message={message} />;
}
