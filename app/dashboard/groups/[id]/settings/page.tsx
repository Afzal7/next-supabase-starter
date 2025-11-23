"use client";

import {
	AlertTriangle,
	Loader2,
	Settings as SettingsIcon,
	Trash2,
	UserX,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Settings } from "@/components/animate-ui/icons/settings";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { groupConfig } from "@/config/groups";
import {
	useDeleteGroupMutation,
	useGetGroupQuery,
	useUpdateGroupMutation,
} from "@/lib/rtk/api";
import { createClient } from "@/lib/supabase/client";

export default function GroupSettingsPage() {
	const params = useParams();
	const router = useRouter();
	const groupId = params.id as string;

	const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
	const [isUserLoading, setIsUserLoading] = useState(true);

	const { data: group, isLoading, error, refetch } = useGetGroupQuery(groupId);
	const [updateGroup, { isLoading: isUpdating }] = useUpdateGroupMutation();
	const [deleteGroup, { isLoading: isDeleting }] = useDeleteGroupMutation();

	// Form state
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	useEffect(() => {
		const getCurrentUser = async () => {
			try {
				const supabase = createClient();
				const {
					data: { user },
					error,
				} = await supabase.auth.getUser();

				if (error || !user) {
					toast.error("Failed to authenticate user");
					router.push("/auth/login");
					return;
				}

				setCurrentUser({ id: user.id });
			} catch (_error) {
				toast.error("Failed to load user information");
				router.push("/auth/login");
			} finally {
				setIsUserLoading(false);
			}
		};

		getCurrentUser();
	}, [router]);

	useEffect(() => {
		if (group) {
			setName(group.name);
			setDescription(group.description || "");
		}
	}, [group]);

	const isOwner = currentUser && group && group.owner_id === currentUser.id;
	const isLoadingAll = isLoading || isUserLoading;

	if (isLoadingAll) {
		return <LoadingSkeleton type="form" />;
	}

	if (error) {
		return (
			<ErrorState
				message="Failed to load group settings. Please try again."
				onRetry={() => refetch()}
			/>
		);
	}

	if (!group) {
		return <ErrorState message="Group not found." />;
	}

	if (!isOwner) {
		return (
			<div className="space-y-6">
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>
						You don't have permission to access this page. Only the group owner
						can modify settings.
					</AlertDescription>
				</Alert>
				<div className="text-center">
					<Button
						variant="outline"
						onClick={() => router.push(`/dashboard/groups/${groupId}`)}
					>
						Back to Group
					</Button>
				</div>
			</div>
		);
	}

	const handleUpdateSettings = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim()) {
			toast.error("Group name is required");
			return;
		}

		try {
			await updateGroup({
				id: groupId,
				body: {
					name: name.trim(),
					description: description.trim(),
				},
			}).unwrap();

			toast.success("Group settings updated successfully");
		} catch (_error) {
			toast.error("Failed to update group settings");
		}
	};

	const handleDeleteGroup = () => {
		toast.error(`Delete ${group.name}?`, {
			description:
				"This action cannot be undone. All members will be removed and all data will be permanently deleted.",
			action: {
				label: "Delete Group",
				onClick: async () => {
					try {
						await deleteGroup(groupId).unwrap();
						toast.success("Group deleted successfully");
						router.push("/dashboard");
					} catch (_error) {
						toast.error("Failed to delete group");
					}
				},
			},
		});
	};

	return (
		<div className="space-y-6">
			{/* General Settings */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Settings className="h-5 w-5" animateOnHover />
						General Settings
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleUpdateSettings} className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="name">Group Name</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Enter group name"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Describe your group (optional)"
								rows={3}
							/>
						</div>

						<Button type="submit" disabled={isUpdating}>
							{isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							{isUpdating ? "Updating..." : "Update Settings"}
						</Button>
					</form>
				</CardContent>
			</Card>

			{/* Group Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<SettingsIcon className="h-5 w-5" />
						Group Information
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div>
							<dt className="text-sm font-medium text-muted-foreground">
								Group ID
							</dt>
							<dd className="text-sm font-mono mt-1">{group.id}</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-muted-foreground">
								Slug
							</dt>
							<dd className="text-sm font-mono mt-1">{group.slug}</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-muted-foreground">
								Created
							</dt>
							<dd className="text-sm mt-1">
								{group.created_at
									? new Date(group.created_at as string).toLocaleDateString()
									: "Unknown"}
							</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-muted-foreground">
								Owner
							</dt>
							<dd className="text-sm mt-1">You</dd>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Danger Zone */}
			<Card className="border-destructive">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-destructive">
						<AlertTriangle className="h-5 w-5" />
						Danger Zone
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div>
						<h4 className="text-sm font-medium text-destructive mb-2">
							Delete {groupConfig.entityName}
						</h4>
						<p className="text-sm text-muted-foreground mb-4">
							Permanently delete this {groupConfig.entityName.toLowerCase()} and
							all associated data. This action cannot be undone.
						</p>
						<Button
							variant="destructive"
							onClick={handleDeleteGroup}
							disabled={isDeleting}
						>
							{isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							<Trash2 className="h-4 w-4 mr-2" />
							{isDeleting ? "Deleting..." : `Delete ${groupConfig.entityName}`}
						</Button>
					</div>

					<Separator />

					<div>
						<h4 className="text-sm font-medium text-destructive mb-2">
							Transfer Ownership
						</h4>
						<p className="text-sm text-muted-foreground mb-4">
							Transfer ownership of this {groupConfig.entityName.toLowerCase()}{" "}
							to another member. You will lose admin privileges.
						</p>
						<Button variant="outline" disabled>
							<UserX className="h-4 w-4 mr-2" />
							Transfer Ownership (Coming Soon)
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
