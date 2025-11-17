import { SignUpForm } from "@/components/auth/sign-up-form";

export default function Page() {
	return (
		<div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm md:max-w-md">
				<SignUpForm />
			</div>
		</div>
	);
}
