"use client";

import { Calendar, Check, Mail, Users, X } from "lucide-react";
import Link from "next/link";

import { FadeIn } from "@/components/animations/fade-in";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 3 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: Fixed number of skeleton items, order never changes
						<Card key={i} className="shadow-sm">
							<CardHeader>
								<Skeleton className="h-5 w-3/4" />
								<Skeleton className="h-4 w-1/2" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-4 w-full mb-2" />
								<Skeleton className="h-4 w-2/3" />
							</CardContent>
						</Card>
					))}
				</div>
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

				<Alert variant="destructive">
					<Mail className="h-4 w-4" />
					<AlertDescription className="flex items-center justify-between">
						<span>Failed to load invitations. Please try again.</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => refetch()}
							className="ml-4"
						>
							Retry
						</Button>
					</AlertDescription>
				</Alert>
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
								className="shadow-sm hover:shadow-md transition-all duration-normal ease-smooth"
							>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
												<Users className="h-5 w-5 text-primary" />
											</div>
											<div>
												<CardTitle className="text-lg text-primary">
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
					<Card className="shadow-sm">
						<CardContent className="p-12 text-center space-y-4">
							<div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
								<Mail className="h-8 w-8 text-secondary" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-primary mb-2">
									No pending invitations
								</h3>
								<p className="text-secondary mb-6">
									You don't have any pending invitations at the moment.
								</p>
								<Link href="/dashboard">
									<Button className="bg-primary hover:bg-primary/90">
										Browse {groupConfig.entityNamePlural}
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</FadeIn>
	);
}
