"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function SignUpForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [repeatPassword, setRepeatPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showRepeatPassword, setShowRepeatPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		// Validation
		if (password.length < 8) {
			setError("Password must be at least 8 characters");
			setIsLoading(false);
			return;
		}

		if (password !== repeatPassword) {
			setError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		const supabase = createClient();

		try {
			const { error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${window.location.origin}/auth/confirm`,
				},
			});
			if (error) throw error;
			router.push("/auth/sign-up-success");
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "An error occurred";
			if (message.includes("already registered")) {
				setError("Account already exists");
			} else {
				setError(message);
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="shadow-sm">
				<CardContent className="p-6">
					<form onSubmit={handleSignUp} className="space-y-6">
						{/* Title */}
						<div className="text-center">
							<h1 className="text-xl font-semibold text-primary">
								Create Account
							</h1>
						</div>

						{/* Email Input */}
						<div className="space-y-2">
							<Label
								htmlFor="email"
								className="text-sm font-medium capitalize text-tertiary"
							>
								Email
							</Label>
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="transition-all duration-normal ease-smooth focus:ring-2 focus:ring-primary/20"
							/>
						</div>

						{/* Password Input */}
						<div className="space-y-2">
							<Label
								htmlFor="password"
								className="text-sm font-medium capitalize text-tertiary"
							>
								Password
							</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="Enter your password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="pr-10 transition-all duration-normal ease-smooth focus:ring-2 focus:ring-primary/20"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-secondary transition-colors"
								>
									{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
								</button>
							</div>
						</div>

						{/* Confirm Password Input */}
						<div className="space-y-2">
							<Label
								htmlFor="repeat-password"
								className="text-sm font-medium capitalize text-tertiary"
							>
								Confirm Password
							</Label>
							<div className="relative">
								<Input
									id="repeat-password"
									type={showRepeatPassword ? "text" : "password"}
									placeholder="Confirm your password"
									required
									value={repeatPassword}
									onChange={(e) => setRepeatPassword(e.target.value)}
									className="pr-10 transition-all duration-normal ease-smooth focus:ring-2 focus:ring-primary/20"
								/>
								<button
									type="button"
									onClick={() => setShowRepeatPassword(!showRepeatPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-secondary transition-colors"
								>
									{showRepeatPassword ? (
										<EyeOff size={20} />
									) : (
										<Eye size={20} />
									)}
								</button>
							</div>
						</div>

						{/* Error Message */}
						{error && (
							<div className="text-sm text-error animate-in slide-in-from-top-2 duration-normal">
								{error}
							</div>
						)}

						{/* Submit Button */}
						<div className="pt-2">
							<Button
								type="submit"
								className="w-full bg-primary hover:bg-primary/90 text-white font-semibold transition-all duration-normal ease-smooth"
								disabled={isLoading}
							>
								{isLoading ? "Creating Account..." : "Create Account"}
							</Button>
						</div>

						{/* Login Link */}
						<div className="text-center pt-4">
							<Link
								href="/auth/login"
								className="text-primary hover:underline text-sm font-medium transition-all duration-fast"
							>
								Already have an account? Sign in
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
