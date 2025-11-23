"use client";

import { Calendar, Check, Mail, Users, X } from "lucide-react";
import Link from "next/link";

import { FadeIn } from "@/components/animations/fade-in";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { groupConfig } from "@/config/groups";
import { useGetUserInvitationsQuery } from "@/lib/rtk/api";
import type { InvitationSummary } from "@/types";

export default function UserInvitationsPage() {
	const {
		data: invitations,
		isLoading,
		error,
		refetch,
	} = useGetUserInvitationsQuery(undefined);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-xl font-semibold text-primary">
							Pending Invitations
						</h1>
						<p className="text-secondary">
							Invitations to join {groupConfig.entityNamePlural.toLowerCase()}
						</p>
					</div>
				</div>

				<LoadingSkeleton
					type="list"
					count={3}
					className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
				/>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-xl font-semibold text-primary">
							Pending Invitations
						</h1>
						<p className="text-secondary">
							Invitations to join {groupConfig.entityNamePlural.toLowerCase()}
						</p>
					</div>
				</div>

				<ErrorState
					message="Failed to load invitations. Please try again."
					onRetry={() => refetch()}
				/>
			</div>
		);
	}

	return (
		<FadeIn>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-xl font-semibold text-primary">
							Pending Invitations
						</h1>
						<p className="text-secondary">
							Invitations to join {groupConfig.entityNamePlural.toLowerCase()}
						</p>
					</div>
				</div>

				{invitations?.invitations && invitations.invitations.length > 0 ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{invitations.invitations.map((invitation: InvitationSummary) => (
							<Card
								key={invitation.id}
								className="shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
							>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
												<Users className="h-5 w-5 text-primary" />
											</div>
											<div>
												<CardTitle className="text-lg text-primary capitalize">
													{invitation.group?.name || "Unknown Group"}
												</CardTitle>
												<p className="text-sm text-secondary">
													{invitation.group?.description || "No description"}
												</p>
											</div>
										</div>
									</div>
								</CardHeader>

								<CardContent className="space-y-4">
									<div className="flex items-center gap-2 text-sm text-secondary">
										<Mail className="h-4 w-4" />
										<span>Invited as {invitation.role}</span>
									</div>

									<div className="flex items-center gap-2 text-sm text-secondary">
										<Calendar className="h-4 w-4" />
										<span>
											Expires{" "}
											{new Date(invitation.expires_at).toLocaleDateString()}
										</span>
									</div>

									<div className="flex gap-2 pt-2">
										<Link
											href={`/invitations/${invitation.id}/accept`}
											className="flex-1"
										>
											<Button className="w-full bg-primary hover:bg-primary/90">
												<Check className="h-4 w-4 mr-2" />
												Accept
											</Button>
										</Link>

										<Link
											href={`/invitations/${invitation.id}/reject`}
											className="flex-1"
										>
											<Button variant="outline" className="w-full">
												<X className="h-4 w-4 mr-2" />
												Decline
											</Button>
										</Link>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : (
					<Link href="/dashboard">
						<EmptyState
							icon={Mail}
							title="No pending invitations"
							description="You don't have any pending invitations at the moment."
							action={{
								label: `Browse ${groupConfig.entityNamePlural}`,
								onClick: () => {
									// Link will handle navigation
								},
							}}
						/>
					</Link>
				)}
			</div>
		</FadeIn>
	);
}
