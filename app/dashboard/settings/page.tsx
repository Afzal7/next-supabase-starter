"use client";

import { Palette, Shield } from "lucide-react";
import { useState } from "react";
import { BadgeCheck } from "@/components/animate-ui/icons/badge-check";
import { Bell } from "@/components/animate-ui/icons/bell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
	const [notifications, setNotifications] = useState({
		email: true,
		push: false,
		marketing: false,
	});

	const [preferences, setPreferences] = useState({
		theme: "system",
		language: "en",
		timezone: "UTC",
	});

	const [security, setSecurity] = useState({
		twoFactor: false,
		sessionTimeout: "30",
	});

	const [isSaving, setIsSaving] = useState(false);
	const [success, setSuccess] = useState<string | null>(null);

	const handleSaveSettings = async () => {
		setIsSaving(true);
		setSuccess(null);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		setSuccess("Settings saved successfully!");
		setIsSaving(false);

		// Clear success message after 3 seconds
		setTimeout(() => setSuccess(null), 3000);
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-primary">Settings</h1>
				<p className="text-muted-foreground">
					Manage your account preferences and security settings.
				</p>
			</div>

			{success && (
				<Alert>
					<BadgeCheck className="h-4 w-4" />
					<AlertDescription>{success}</AlertDescription>
				</Alert>
			)}

			{/* General Settings */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Palette className="h-5 w-5" />
						General
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="theme">Theme</Label>
						<Select
							value={preferences.theme}
							onValueChange={(value) =>
								setPreferences((prev) => ({ ...prev, theme: value }))
							}
						>
							<SelectTrigger className="transition-all duration-normal ease-smooth focus:ring-2 focus:ring-primary/20">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="light">Light</SelectItem>
								<SelectItem value="dark">Dark</SelectItem>
								<SelectItem value="system">System</SelectItem>
							</SelectContent>
						</Select>
						<p className="text-xs text-muted-foreground">
							Choose your preferred theme or follow system settings.
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="language">Language</Label>
						<Select
							value={preferences.language}
							onValueChange={(value) =>
								setPreferences((prev) => ({ ...prev, language: value }))
							}
						>
							<SelectTrigger className="transition-all duration-normal ease-smooth focus:ring-2 focus:ring-primary/20">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="en">English</SelectItem>
								<SelectItem value="es">Spanish</SelectItem>
								<SelectItem value="fr">French</SelectItem>
								<SelectItem value="de">German</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="timezone">Timezone</Label>
						<Select
							value={preferences.timezone}
							onValueChange={(value) =>
								setPreferences((prev) => ({ ...prev, timezone: value }))
							}
						>
							<SelectTrigger className="transition-all duration-normal ease-smooth focus:ring-2 focus:ring-primary/20">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="UTC">UTC</SelectItem>
								<SelectItem value="EST">Eastern Time</SelectItem>
								<SelectItem value="PST">Pacific Time</SelectItem>
								<SelectItem value="GMT">Greenwich Mean Time</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Notifications */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Bell className="h-5 w-5" animateOnHover />
						Notifications
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label htmlFor="email-notifications">Email Notifications</Label>
							<p className="text-xs text-muted-foreground">
								Receive notifications via email
							</p>
						</div>
						<Switch
							id="email-notifications"
							checked={notifications.email}
							onCheckedChange={(checked) =>
								setNotifications((prev) => ({ ...prev, email: checked }))
							}
						/>
					</div>

					<Separator />

					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label htmlFor="push-notifications">Push Notifications</Label>
							<p className="text-xs text-muted-foreground">
								Receive push notifications in your browser
							</p>
						</div>
						<Switch
							id="push-notifications"
							checked={notifications.push}
							onCheckedChange={(checked) =>
								setNotifications((prev) => ({ ...prev, push: checked }))
							}
						/>
					</div>

					<Separator />

					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label htmlFor="marketing-notifications">
								Marketing Communications
							</Label>
							<p className="text-xs text-muted-foreground">
								Receive updates about new features and promotions
							</p>
						</div>
						<Switch
							id="marketing-notifications"
							checked={notifications.marketing}
							onCheckedChange={(checked) =>
								setNotifications((prev) => ({ ...prev, marketing: checked }))
							}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Security */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Shield className="h-5 w-5" />
						Security
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label htmlFor="two-factor">Two-Factor Authentication</Label>
							<p className="text-xs text-muted-foreground">
								Add an extra layer of security to your account
							</p>
						</div>
						<Switch
							id="two-factor"
							checked={security.twoFactor}
							onCheckedChange={(checked) =>
								setSecurity((prev) => ({ ...prev, twoFactor: checked }))
							}
						/>
					</div>

					<Separator />

					<div className="space-y-2">
						<Label htmlFor="session-timeout">Session Timeout</Label>
						<Select
							value={security.sessionTimeout}
							onValueChange={(value) =>
								setSecurity((prev) => ({ ...prev, sessionTimeout: value }))
							}
						>
							<SelectTrigger className="transition-all duration-normal ease-smooth focus:ring-2 focus:ring-primary/20">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="15">15 minutes</SelectItem>
								<SelectItem value="30">30 minutes</SelectItem>
								<SelectItem value="60">1 hour</SelectItem>
								<SelectItem value="240">4 hours</SelectItem>
								<SelectItem value="never">Never</SelectItem>
							</SelectContent>
						</Select>
						<p className="text-xs text-muted-foreground">
							Automatically log out after period of inactivity
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Save Button */}
			<div className="flex justify-end">
				<Button
					onClick={handleSaveSettings}
					disabled={isSaving}
					className="bg-primary hover:bg-primary/90"
				>
					{isSaving ? "Saving..." : "Save Settings"}
				</Button>
			</div>
		</div>
	);
}
