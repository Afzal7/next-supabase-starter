"use client";

import Link from "next/link";
import { Plus } from "@/components/animate-ui/icons/plus";
import { Users } from "@/components/animate-ui/icons/users";
import { CreateGroupModal } from "@/components/groups/create-group-modal";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { groupConfig } from "@/config/groups";
import { useGetGroupsQuery } from "@/lib/rtk/api";

export default function Dashboard() {
	const {
		data: groupsResponse,
		isLoading,
		error,
		refetch,
	} = useGetGroupsQuery({
		page: 1,
		limit: 20,
	});

	const groups = groupsResponse?.data || [];

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-xl font-semibold text-primary">
							Your {groupConfig.entityNamePlural}
						</h1>
						<p className="text-secondary">
							Manage your {groupConfig.entityNamePlural.toLowerCase()}
						</p>
					</div>
				</div>
				<LoadingSkeleton
					type="list"
					count={6}
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
						<h1 className="text-xl font-semibold text-primary">Your Groups</h1>
						<p className="text-secondary">
							Manage your organizations and teams
						</p>
					</div>
				</div>
				<ErrorState
					message="Failed to load groups. Please try again."
					onRetry={() => refetch()}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold text-primary">
						Your {groupConfig.entityNamePlural}
					</h1>
					<p className="text-secondary">
						Manage your {groupConfig.entityNamePlural.toLowerCase()}
					</p>
				</div>
			</div>

			{/* Groups Grid */}
			{groups.length === 0 ? (
				<Card className="shadow-sm">
					<CardContent className="p-12 text-center space-y-4">
						<div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
							<Users className="h-8 w-8 text-primary" animateOnHover />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-primary mb-2">
								No {groupConfig.entityNamePlural.toLowerCase()} yet
							</h3>
							<p className="text-secondary mb-6">
								Create your first {groupConfig.entityName.toLowerCase()} to
								start collaborating with your team.
							</p>
							<CreateGroupModal>
								<Button className="bg-primary hover:bg-primary/90">
									<Plus className="h-4 w-4 mr-2" />
									Create Your First {groupConfig.entityName}
								</Button>
							</CreateGroupModal>
						</div>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{groups.map((group) => (
						<Link key={group.id} href={`/dashboard/groups/${group.id}`}>
							<Card className="shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 ease-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2">
								<CardHeader>
									<CardTitle className="text-lg text-primary">
										{group.name}
									</CardTitle>
									<p className="text-sm text-secondary">
										{group.description || "No description"}
									</p>
								</CardHeader>
								<CardContent>
									<div className="flex items-center justify-between text-sm text-tertiary">
										<span className="capitalize">{group.group_type}</span>
										<span className="text-xs">
											Created{" "}
											{group.created_at
												? new Date(
														group.created_at as string,
													).toLocaleDateString()
												: "Unknown"}
										</span>
									</div>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
