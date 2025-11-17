"use client";

import { AlertCircle, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { BadgeCheck } from "@/components/animate-ui/icons/badge-check";
import { User } from "@/components/animate-ui/icons/user";
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
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

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

	const handleUpdateProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsUpdating(true);
		setError(null);
		setSuccess(null);

		try {
			const supabase = createClient();
			const { error } = await supabase.auth.updateUser({
				data: {
					name: name.trim(),
				},
			});

			if (error) throw error;

			setSuccess("Profile updated successfully!");
			setUser((prev) => (prev ? { ...prev, name: name.trim() } : null));
		} catch (error: unknown) {
			setError(
				error instanceof Error ? error.message : "Failed to update profile",
			);
		} finally {
			setIsUpdating(false);
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<div className="w-20 h-20 bg-muted rounded-full animate-pulse" />
					<div className="space-y-2">
						<div className="h-6 w-48 bg-muted rounded animate-pulse" />
						<div className="h-4 w-32 bg-muted rounded animate-pulse" />
					</div>
				</div>
				<Card>
					<CardHeader>
						<div className="h-5 w-32 bg-muted rounded animate-pulse" />
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="h-10 w-full bg-muted rounded animate-pulse" />
						<div className="h-10 w-full bg-muted rounded animate-pulse" />
					</CardContent>
				</Card>
			</div>
		);
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
					<form onSubmit={handleUpdateProfile} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Display Name</Label>
							<Input
								id="name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Enter your display name"
								className="transition-all duration-normal ease-smooth focus:ring-2 focus:ring-primary/20"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">Email Address</Label>
							<Input
								id="email"
								type="email"
								value={email}
								disabled
								className="bg-muted cursor-not-allowed"
							/>
							<p className="text-xs text-muted-foreground">
								Email cannot be changed here. Contact support if needed.
							</p>
						</div>

						{error && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						{success && (
							<Alert>
								<BadgeCheck className="h-4 w-4" />
								<AlertDescription>{success}</AlertDescription>
							</Alert>
						)}

						<div className="flex gap-3">
							<Button
								type="submit"
								disabled={isUpdating || !name.trim()}
								className="bg-primary hover:bg-primary/90"
							>
								{isUpdating ? "Updating..." : "Update Profile"}
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
