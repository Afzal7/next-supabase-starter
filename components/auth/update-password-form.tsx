"use client";

import { Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function UpdatePasswordForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleUpdatePassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		// Validation
		if (password.length < 8) {
			setError("Password must be at least 8 characters");
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		const supabase = createClient();
		setIsLoading(true);

		try {
			const { error } = await supabase.auth.updateUser({ password });
			if (error) throw error;
			router.push("/dashboard");
		} catch (error: unknown) {
			setError(error instanceof Error ? error.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<Card className="shadow-sm">
					<CardHeader>
						<CardTitle className="text-xl font-semibold text-primary">
							Update Password
						</CardTitle>
						<CardDescription>Enter your new password below.</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleUpdatePassword} className="space-y-6">
							{/* Password Input */}
							<div className="space-y-2">
								<Label
									htmlFor="password"
									className="text-sm font-medium capitalize text-tertiary"
								>
									New Password
								</Label>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										placeholder="Enter your new password"
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
									htmlFor="confirm-password"
									className="text-sm font-medium capitalize text-tertiary"
								>
									Confirm Password
								</Label>
								<div className="relative">
									<Input
										id="confirm-password"
										type={showConfirmPassword ? "text" : "password"}
										placeholder="Confirm your new password"
										required
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										className="pr-10 transition-all duration-normal ease-smooth focus:ring-2 focus:ring-primary/20"
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-secondary transition-colors"
									>
										{showConfirmPassword ? (
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
									{isLoading ? "Updating..." : "Update Password"}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
