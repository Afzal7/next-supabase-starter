"use client";

import { ErrorState } from "@/components/shared/error-state";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useGetGroupsQuery, useGetUserInvitationsQuery } from "@/lib/rtk/api";
import { CreateFirstTeamCard } from "./_components/CreateFirstTeamCard";
import { CreatePostCard } from "./_components/CreatePostCard";
import { ExploreFeaturesCard } from "./_components/ExploreFeaturesCard";
import { GettingStartedActivityCard } from "./_components/GettingStartedActivityCard";
import { PendingInvitationsCard } from "./_components/PendingInvitationsCard";
import { QuickActionsCard } from "./_components/QuickActionsCard";
import { RecentActivityCard } from "./_components/RecentActivityCard";
import { YourTeamsCard } from "./_components/YourTeamsCard";

export default function Dashboard() {
	const {
		data: groupsResponse,
		isLoading: groupsLoading,
		error: groupsError,
		refetch: refetchGroups,
	} = useGetGroupsQuery({
		page: 1,
		limit: 20,
	});

	const {
		data: invitationsResponse,
		isLoading: invitationsLoading,
		error: invitationsError,
		refetch: refetchInvitations,
	} = useGetUserInvitationsQuery(undefined);

	const groups = groupsResponse?.data || [];
	const invitations = invitationsResponse?.invitations || [];
	const hasPendingInvitations = invitations.length > 0;

	const isLoading = groupsLoading || invitationsLoading;
	const hasError = groupsError || invitationsError;

	if (isLoading) {
		return (
			<div className="space-y-8">
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold text-primary">Welcome back!</h1>
					<p className="text-lg text-secondary">
						Here's what's happening with your workspace
					</p>
				</div>
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{["a", "b", "c", "d", "e", "f"].map((key) => (
						<Card key={`skeleton-${key}`} className="shadow-sm">
							<CardHeader className="pb-3">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
									<div className="space-y-2 flex-1">
										<div className="h-4 bg-muted rounded animate-pulse" />
										<div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<div className="h-3 bg-muted rounded animate-pulse" />
									<div className="h-8 bg-muted rounded animate-pulse" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (hasError) {
		return (
			<div className="space-y-8">
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold text-primary">Welcome back!</h1>
					<p className="text-lg text-secondary">
						Here's what's happening with your workspace
					</p>
				</div>
				<ErrorState
					message="Failed to load dashboard. Please try again."
					onRetry={() => {
						refetchGroups();
						refetchInvitations();
					}}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="text-center space-y-2">
				<h1 className="text-3xl font-bold text-primary">
					Welcome to your workspace
				</h1>
				<p className="text-lg text-secondary">
					Manage your teams, create content, and collaborate with others
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{/* Priority 1: Pending Invitations */}
				{hasPendingInvitations && (
					<PendingInvitationsCard invitations={invitations} />
				)}

				{/* Priority 2: Team Overview */}
				{groups.length > 0 && <YourTeamsCard groups={groups} />}

				{/* Priority 3: Create Team */}
				{groups.length === 0 && !hasPendingInvitations && (
					<CreateFirstTeamCard />
				)}

				{/* Explore Features */}
				<ExploreFeaturesCard />

				{/* Create Post */}
				<CreatePostCard />

				{/* Recent Activity */}
				<RecentActivityCard />

				{/* Quick Actions */}
				<QuickActionsCard />

				{/* Getting Started/Activity */}
				<GettingStartedActivityCard hasTeams={groups.length > 0} />
			</div>
		</div>
	);
}
