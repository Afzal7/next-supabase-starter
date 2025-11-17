"use client";

import { MoreHorizontal, UserX } from "lucide-react";
import { useParams } from "next/navigation";
import { Users } from "@/components/animate-ui/icons/users";

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
	useGetGroupQuery,
	useRemoveMemberMutation,
	useUpdateMemberMutation,
} from "@/lib/rtk/api";
import { InviteMemberModal } from "../_components/InviteMemberModal";

export default function GroupMembersPage() {
	const params = useParams();
	const groupId = params.id as string;

	const { data: group } = useGetGroupQuery(groupId);
	const [updateMember] = useUpdateMemberMutation();
	const [removeMember] = useRemoveMemberMutation();

	if (!group) return null;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">
					{groupConfig.entityName} Members
				</h3>
				<InviteMemberModal groupId={groupId} />
			</div>

			{group.members && group.members.length > 0 ? (
				<div className="grid gap-4">
					{group.members.map((member) => (
						<Card key={member.id} className="hover:shadow-md transition-shadow">
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
															updateMember({
																groupId,
																userId: member.user_id,
																body: { role },
															})
														}
														disabled={member.role === role}
													>
														Set as{" "}
														{role.charAt(0).toUpperCase() + role.slice(1)}
													</DropdownMenuItem>
												))}
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onClick={() => {
														if (
															confirm(
																`Remove ${member.user?.name || member.user?.email} from the group?`,
															)
														) {
															removeMember({ groupId, userId: member.user_id });
														}
													}}
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
				<Card>
					<CardContent className="p-12 text-center">
						<Users
							className="h-12 w-12 text-muted-foreground mx-auto mb-4"
							animateOnHover
						/>
						<h3 className="text-lg font-semibold text-primary mb-2">
							No members yet
						</h3>
						<p className="text-secondary mb-4">
							Invite your first team member to get started.
						</p>
						<InviteMemberModal groupId={groupId} />
					</CardContent>
				</Card>
			)}
		</div>
	);
}
