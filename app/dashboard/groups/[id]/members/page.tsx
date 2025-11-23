"use client";

import { MoreHorizontal, UserX } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Users } from "@/components/animate-ui/icons/users";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { groupConfig } from "@/config/groups";
import {
	useGetMembersQuery,
	useRemoveMemberMutation,
	useUpdateMemberMutation,
} from "@/lib/rtk/api";

export default function GroupMembersPage() {
	const params = useParams();
	const groupId = params.id as string;

	const {
		data: membersResponse,
		isLoading,
		error,
		refetch,
	} = useGetMembersQuery({ groupId });
	const [updateMember] = useUpdateMemberMutation();
	const [removeMember] = useRemoveMemberMutation();

	const members = membersResponse?.data || [];

	const handleUpdateRole = async (
		userId: string,
		role: string,
		memberName?: string,
	) => {
		try {
			await updateMember({
				groupId,
				userId,
				body: { role },
			}).unwrap();
			toast.success(
				`${memberName || "Member"}'s role has been updated to ${role}.`,
			);
		} catch (_error) {
			toast.error("Failed to update role. Please try again.");
		}
	};

	const handleRemoveMember = (userId: string, memberName?: string) => {
		const memberDisplayName = memberName || "this member";
		toast.error(`Remove ${memberDisplayName} from the group?`, {
			action: {
				label: "Remove",
				onClick: async () => {
					try {
						await removeMember({ groupId, userId }).unwrap();
						toast.success(
							`${memberName || "Member"} has been removed from the group.`,
						);
					} catch (_error) {
						toast.error("Failed to remove member. Please try again.");
					}
				},
			},
		});
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold">
						{groupConfig.entityName} Members
					</h3>
				</div>
				<LoadingSkeleton type="list" count={3} className="grid gap-4" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold">
						{groupConfig.entityName} Members
					</h3>
				</div>
				<ErrorState
					message="Failed to load members. Please try again."
					onRetry={() => refetch()}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">
					{groupConfig.entityName} Members
				</h3>
			</div>

			{members.length > 0 ? (
				<div className="grid gap-4">
					{members.map((member) => (
						<Card
							key={member.id}
							className="hover:shadow-md hover:scale-[1.01] transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
						>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<Avatar className="h-10 w-10">
											<AvatarFallback>
												{member.user?.name?.charAt(0) ||
													member.user?.email?.charAt(0) ||
													"U"}
											</AvatarFallback>
										</Avatar>
										<div>
											<p className="font-medium text-primary">
												{member.user?.name || "Unknown User"}
											</p>
											<p className="text-sm text-secondary">
												{member.user?.email}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Badge
											variant={
												member.role === "owner" ? "default" : "secondary"
											}
										>
											{member.role}
										</Badge>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="sm">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuSeparator />
												<DropdownMenuLabel>Change Role</DropdownMenuLabel>
												{groupConfig.defaultRoles.map((role) => (
													<DropdownMenuItem
														key={role}
														onClick={() =>
															handleUpdateRole(
																member.user_id,
																role,
																member.user?.name,
															)
														}
														disabled={member.role === role}
													>
														Set as{" "}
														{role.charAt(0).toUpperCase() + role.slice(1)}
													</DropdownMenuItem>
												))}
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onClick={() =>
														handleRemoveMember(
															member.user_id,
															member.user?.name,
														)
													}
													className="text-destructive"
												>
													<UserX className="h-4 w-4 mr-2" />
													Remove Member
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<EmptyState
					icon={Users}
					title="No members yet"
					description="Invite your first team member to get started."
				/>
			)}
		</div>
	);
}
