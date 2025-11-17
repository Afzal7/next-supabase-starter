"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { groupConfig } from "@/config/groups";
import { useInviteMemberMutation } from "@/lib/rtk/api";
import {
	type InviteMemberInput,
	inviteMemberSchema,
} from "@/lib/schemas/groupSchemas";

interface InviteMemberModalProps {
	groupId: string;
	children?: React.ReactNode;
}

export function InviteMemberModal({
	groupId,
	children,
}: InviteMemberModalProps) {
	const [open, setOpen] = useState(false);
	const [inviteMember, { isLoading, error }] = useInviteMemberMutation();

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
		watch,
	} = useForm<InviteMemberInput>({
		resolver: zodResolver(inviteMemberSchema),
		defaultValues: {
			role: (groupConfig.defaultRoles.includes("member")
				? "member"
				: groupConfig.defaultRoles[0]) as "owner" | "admin" | "member",
		},
	});

	const onSubmit = async (data: InviteMemberInput) => {
		try {
			await inviteMember({
				groupId,
				body: data,
			}).unwrap();

			// Success - close modal and reset form
			setOpen(false);
			reset();
		} catch (error) {
			// Error is handled by RTK Query
			console.error("Failed to invite member:", error);
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (!newOpen) {
			reset();
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				{children || (
					<Button size="sm" className="bg-primary hover:bg-primary/90">
						<UserPlus className="h-4 w-4 mr-2" />
						Invite Member
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Invite New Member</DialogTitle>
					<DialogDescription>
						Send an invitation to add a new member to this{" "}
						{groupConfig.entityName.toLowerCase()}.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					{/* Email Field */}
					<div className="space-y-2">
						<Label htmlFor="email">Email Address</Label>
						<Input
							id="email"
							type="email"
							placeholder="member@example.com"
							{...register("email")}
							className={errors.email ? "border-destructive" : ""}
						/>
						{errors.email && (
							<p className="text-sm text-destructive">{errors.email.message}</p>
						)}
					</div>

					{/* Role Field */}
					<div className="space-y-2">
						<Label htmlFor="role">Role</Label>
						<Select
							value={watch("role")}
							onValueChange={(value) =>
								setValue("role", value as "owner" | "admin" | "member")
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a role" />
							</SelectTrigger>
							<SelectContent>
								{groupConfig.defaultRoles.map((role) => (
									<SelectItem key={role} value={role}>
										{role.charAt(0).toUpperCase() + role.slice(1)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errors.role && (
							<p className="text-sm text-destructive">{errors.role.message}</p>
						)}
					</div>

					{/* Error Alert */}
					{error && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								Failed to send invitation. Please try again.
							</AlertDescription>
						</Alert>
					)}

					{/* Actions */}
					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Sending...
								</>
							) : (
								<>
									<UserPlus className="h-4 w-4 mr-2" />
									Send Invitation
								</>
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
