"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Plus } from "@/components/animate-ui/icons/plus";
import { Users } from "@/components/animate-ui/icons/users";
import { CreateGroupModal } from "@/components/groups/create-group-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
					<Skeleton className="h-10 w-32" />
				</div>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: Fixed number of skeleton items, order never changes
						<Card key={i} className="shadow-sm">
							<CardHeader>
								<Skeleton className="h-5 w-3/4" />
								<Skeleton className="h-4 w-1/2" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-4 w-1/4" />
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
						<h1 className="text-xl font-semibold text-primary">Your Groups</h1>
						<p className="text-secondary">
							Manage your organizations and teams
						</p>
					</div>
				</div>
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription className="flex items-center justify-between">
						<span>Failed to load groups. Please try again.</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => refetch()}
							className="ml-4"
						>
							<RefreshCw className="h-4 w-4 mr-2" />
							Retry
						</Button>
					</AlertDescription>
				</Alert>
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
							<Card className="shadow-sm hover:shadow-md transition-all duration-normal ease-smooth cursor-pointer">
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
