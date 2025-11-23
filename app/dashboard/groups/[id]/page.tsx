"use client";

import {
	ArrowRight,
	Calendar,
	FileText,
	Hash,
	Settings,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Card, CardContent } from "@/components/ui/card";

import { groupConfig } from "@/config/groups";
import { useGetGroupQuery } from "@/lib/rtk/api";

export default function GroupOverviewPage() {
	const params = useParams();
	const groupId = params.id as string;

	const {
		data: group,
		isLoading: groupLoading,
		error: groupError,
		refetch: refetchGroup,
	} = useGetGroupQuery(groupId);
	const isLoading = groupLoading;
	const error = groupError;

	const refetch = () => {
		refetchGroup();
	};

	if (isLoading) {
		return <LoadingSkeleton type="card" className="space-y-6" />;
	}

	if (error) {
		return (
			<ErrorState
				message="Failed to load group information. Please try again."
				onRetry={refetch}
			/>
		);
	}

	if (!group) {
		return <ErrorState message={`${groupConfig.entityName} not found.`} />;
	}

	return (
		<div className="space-y-8">
			{/* Hero Section */}
			<div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8">
				<div className="space-y-4">
					<div>
						<h1 className="text-3xl font-bold capitalize">{group.name}</h1>
						<div className="flex items-center gap-2 mt-1">
							<span className="text-sm text-muted-foreground">
								#{group.slug}
							</span>
						</div>
					</div>

					{group.description && (
						<p className="text-lg text-muted-foreground max-w-2xl">
							{group.description}
						</p>
					)}

					<div className="flex items-center gap-6 text-sm text-muted-foreground">
						<div className="flex items-center gap-1">
							<Calendar className="h-4 w-4" />
							Created{" "}
							{group.created_at
								? new Date(group.created_at).toLocaleDateString()
								: "Unknown"}
						</div>
						<div className="flex items-center gap-1">
							<Hash className="h-4 w-4" />
							ID: {group.id.slice(0, 8)}...
						</div>
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
					<Link href={`/dashboard/groups/${groupId}/members`}>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<Users className="h-5 w-5 text-primary" />
										<h3 className="font-semibold">Members</h3>
									</div>
									<p className="text-sm text-muted-foreground">
										Manage team members and permissions
									</p>
								</div>
								<ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
							</div>
						</CardContent>
					</Link>
				</Card>

				<Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
					<Link href={`/dashboard/groups/${groupId}/invitations`}>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<FileText className="h-5 w-5 text-primary" />
										<h3 className="font-semibold">Invitations</h3>
									</div>
									<p className="text-sm text-muted-foreground">
										View and manage pending invitations
									</p>
								</div>
								<ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
							</div>
						</CardContent>
					</Link>
				</Card>

				<Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
					<Link href={`/dashboard/groups/${groupId}/settings`}>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<Settings className="h-5 w-5 text-primary" />
										<h3 className="font-semibold">Settings</h3>
									</div>
									<p className="text-sm text-muted-foreground">
										Configure group preferences
									</p>
								</div>
								<ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
							</div>
						</CardContent>
					</Link>
				</Card>
			</div>
		</div>
	);
}
