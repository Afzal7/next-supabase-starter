"use client";

import { Loader2, Mail, MoreHorizontal, UserX } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
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

export default function GroupInvitationsPage() {
	const params = useParams();
	const groupId = params.id as string;

	const {
		data: invitations,
		isLoading,
		error,
		refetch,
	} = useGetInvitationsQuery(groupId);
	const [resendInvitation, { isLoading: isResending }] =
		useResendInvitationMutation();
	const [cancelInvitation, { isLoading: isCancelling }] =
		useCancelInvitationMutation();

	const handleResendInvitation = async (invitationId: string) => {
		try {
			await resendInvitation(invitationId).unwrap();
			toast.success("Invitation resent successfully.");
		} catch (_error) {
			toast.error("Failed to resend invitation. Please try again.");
		}
	};

	const handleCancelInvitation = async (
		groupId: string,
		invitationId: string,
	) => {
		try {
			await cancelInvitation({ groupId, invitationId }).unwrap();
			toast.success("Invitation cancelled successfully.");
		} catch (_error) {
			toast.error("Failed to cancel invitation. Please try again.");
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold">Pending Invitations</h3>
				</div>
				<LoadingSkeleton type="list" count={3} className="grid gap-4" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold">Pending Invitations</h3>
				</div>
				<ErrorState
					message="Failed to load invitations. Please try again."
					onRetry={() => refetch()}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Pending Invitations</h3>
				{/* <InviteMemberModal groupId={groupId} /> */}
			</div>

			{invitations && invitations.length > 0 ? (
				<div className="grid gap-4">
					{invitations.map((invitation) => (
						<Card
							key={invitation.id}
							className="hover:shadow-md hover:scale-[1.01] transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
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
														onClick={() =>
															handleResendInvitation(invitation.id)
														}
														disabled={isResending}
													>
														{isResending && (
															<Loader2 className="h-4 w-4 mr-2 animate-spin" />
														)}
														Resend Invitation
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => {
															if (confirm("Cancel this invitation?")) {
																handleCancelInvitation(groupId, invitation.id);
															}
														}}
														className="text-destructive"
														disabled={isCancelling}
													>
														{isCancelling && (
															<Loader2 className="h-4 w-4 mr-2 animate-spin" />
														)}
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
				<EmptyState
					icon={Mail}
					title="No pending invitations"
					description="Send invitations to add new members to your group."
				/>
			)}
		</div>
	);
}
