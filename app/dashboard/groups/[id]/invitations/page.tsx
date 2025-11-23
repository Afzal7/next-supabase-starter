"use client";

import { Mail, MoreHorizontal, UserX } from "lucide-react";
import { useParams } from "next/navigation";

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
import {
	useCancelInvitationMutation,
	useGetInvitationsQuery,
	useResendInvitationMutation,
} from "@/lib/rtk/api";
import { InviteMemberModal } from "../_components/InviteMemberModal";

export default function GroupInvitationsPage() {
	const params = useParams();
	const groupId = params.id as string;

	const {
		data: invitations,
		isLoading,
		error,
	} = useGetInvitationsQuery(groupId);
	const [resendInvitation] = useResendInvitationMutation();
	const [cancelInvitation] = useCancelInvitationMutation();

	if (isLoading || error) return null;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Pending Invitations</h3>
				<InviteMemberModal groupId={groupId} />
			</div>

			{invitations && invitations.length > 0 ? (
				<div className="grid gap-4">
					{invitations.map((invitation) => (
						<Card
							key={invitation.id}
							className="hover:shadow-md transition-shadow"
						>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
											<Mail className="h-5 w-5 text-primary" />
										</div>
										<div>
											<p className="font-medium text-primary">
												{invitation.email}
											</p>
											<p className="text-sm text-secondary">
												Invited{" "}
												{invitation.created_at
													? new Date(invitation.created_at).toLocaleDateString()
													: "Unknown"}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Badge variant="outline">{invitation.role}</Badge>
										<Badge
											variant={
												invitation.status === "pending"
													? "secondary"
													: "default"
											}
										>
											{invitation.status}
										</Badge>
										{invitation.status === "pending" && (
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="sm">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuLabel>Actions</DropdownMenuLabel>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														onClick={() => resendInvitation(invitation.id)}
													>
														Resend Invitation
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => {
															if (confirm("Cancel this invitation?")) {
																cancelInvitation({
																	groupId,
																	invitationId: invitation.id,
																});
															}
														}}
														className="text-destructive"
													>
														<UserX className="h-4 w-4 mr-2" />
														Cancel Invitation
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<Card>
					<CardContent className="p-12 text-center">
						<Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold text-primary mb-2">
							No pending invitations
						</h3>
						<p className="text-secondary mb-4">
							Send invitations to add new members to your group.
						</p>
						<InviteMemberModal groupId={groupId} />
					</CardContent>
				</Card>
			)}
		</div>
	);
}
