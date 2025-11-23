"use client";

import { AlertCircle, Loader2, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { User } from "@/components/animate-ui/icons/user";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
	const [user, setUser] = useState<{
		id: string;
		name?: string;
		email?: string;
		avatar?: string;
	} | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isUpdating, setIsUpdating] = useState(false);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [nameError, setNameError] = useState<string | null>(null);

	useEffect(() => {
		const getUser = async () => {
			const supabase = createClient();
			const {
				data: { user: authUser },
			} = await supabase.auth.getUser();

			if (authUser) {
				const userData = {
					id: authUser.id,
					name: authUser.user_metadata?.name || authUser.email?.split("@")[0],
					email: authUser.email,
					avatar: authUser.user_metadata?.avatar_url,
				};
				setUser(userData);
				setName(userData.name || "");
				setEmail(userData.email || "");
			}
			setIsLoading(false);
		};

		getUser();
	}, []);

	const validateName = (value: string) => {
		if (!value.trim()) {
			return "Name is required";
		}
		if (value.trim().length < 2) {
			return "Name must be at least 2 characters";
		}
		if (value.trim().length > 50) {
			return "Name must be less than 50 characters";
		}
		return null;
	};

	const handleNameChange = (value: string) => {
		setName(value);
		const error = validateName(value);
		setNameError(error);
	};

	const handleUpdateProfile = async (e: React.FormEvent) => {
		e.preventDefault();

		const error = validateName(name);
		if (error) {
			setNameError(error);
			return;
		}

		setIsUpdating(true);

		try {
			const supabase = createClient();
			const { error } = await supabase.auth.updateUser({
				data: {
					name: name.trim(),
				},
			});

			if (error) throw error;

			toast.success("Profile updated successfully!");
			setUser((prev) => (prev ? { ...prev, name: name.trim() } : null));
			setNameError(null);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to update profile";
			toast.error(errorMessage);
		} finally {
			setIsUpdating(false);
		}
	};

	if (isLoading) {
		return <LoadingSkeleton type="profile" />;
	}

	if (!user) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					Unable to load profile. Please try refreshing the page.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Avatar className="w-20 h-20">
					<AvatarImage src={user.avatar} alt={user.name} />
					<AvatarFallback className="text-lg">
						{user.name?.charAt(0) || user.email?.charAt(0) || "U"}
					</AvatarFallback>
				</Avatar>
				<div>
					<h1 className="text-2xl font-semibold text-primary">{user.name}</h1>
					<p className="text-muted-foreground flex items-center gap-2">
						<Mail className="h-4 w-4" />
						{user.email}
					</p>
				</div>
			</div>

			{/* Profile Form */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" animateOnHover />
						Account Information
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleUpdateProfile} className="space-y-4" noValidate>
						<div className="space-y-2">
							<Label htmlFor="name">Display Name</Label>
							<Input
								id="name"
								type="text"
								value={name}
								onChange={(e) => handleNameChange(e.target.value)}
								placeholder="Enter your display name"
								aria-describedby={nameError ? "name-error" : undefined}
								aria-invalid={!!nameError}
								className={`transition-all duration-normal ease-smooth focus:ring-2 focus:ring-primary/20 ${
									nameError
										? "border-destructive focus:ring-destructive/20"
										: ""
								}`}
							/>
							{nameError && (
								<p
									id="name-error"
									className="text-sm text-destructive mt-1"
									role="alert"
								>
									{nameError}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">Email Address</Label>
							<Input
								id="email"
								type="email"
								value={email}
								disabled
								aria-describedby="email-help"
								className="bg-muted cursor-not-allowed"
							/>
							<p id="email-help" className="text-xs text-muted-foreground">
								Email cannot be changed here. Contact support if needed.
							</p>
						</div>

						<div className="flex gap-3">
							<Button
								type="submit"
								disabled={isUpdating || !name.trim() || !!nameError}
								aria-describedby={isUpdating ? "updating-status" : undefined}
								className="bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
							>
								{isUpdating && (
									<Loader2
										className="h-4 w-4 mr-2 animate-spin"
										aria-hidden="true"
									/>
								)}
								<span id="updating-status" aria-live="polite">
									{isUpdating ? "Updating..." : "Update Profile"}
								</span>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			{/* Account Stats */}
			<Card>
				<CardHeader>
					<CardTitle>Account Overview</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3">
						<div className="text-center">
							<div className="text-2xl font-bold text-primary">0</div>
							<div className="text-sm text-muted-foreground">Groups</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-primary">0</div>
							<div className="text-sm text-muted-foreground">Invitations</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-primary">Active</div>
							<div className="text-sm text-muted-foreground">Status</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
