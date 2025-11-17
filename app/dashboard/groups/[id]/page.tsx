"use client";

import { useParams } from "next/navigation";
import { Settings } from "@/components/animate-ui/icons/settings";
import { Users } from "@/components/animate-ui/icons/users";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { groupConfig } from "@/config/groups";
import { useGetGroupQuery } from "@/lib/rtk/api";

export default function GroupOverviewPage() {
	const params = useParams();
	const groupId = params.id as string;

	const { data: group, isLoading, error } = useGetGroupQuery(groupId);

	if (isLoading || error || !group) {
		return null; // Layout handles loading and error states
	}

	return (
		<div className="space-y-6">
			<div className="grid gap-6 md:grid-cols-2">
				{/* Group Info */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Settings className="h-5 w-5" animateOnHover />
							{groupConfig.entityName} Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<dt className="text-sm font-medium text-tertiary">Name</dt>
							<dd className="text-primary mt-1">{group.name}</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-tertiary">Slug</dt>
							<dd className="text-primary font-mono text-sm mt-1">
								{group.slug}
							</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-tertiary">Type</dt>
							<dd className="text-primary capitalize mt-1">
								{group.group_type}
							</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-tertiary">Description</dt>
							<dd className="text-primary mt-1">
								{group.description || "No description"}
							</dd>
						</div>
					</CardContent>
				</Card>

				{/* Quick Stats */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" animateOnHover />
							Quick Stats
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<span className="text-secondary">Total Members</span>
							<span className="font-semibold">
								{group.members?.length || 0}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-secondary">Active Invitations</span>
							<span className="font-semibold">
								{group.invitations?.length || 0}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-secondary">Created</span>
							<span className="font-semibold text-sm">
								{new Date(group.created_at).toLocaleDateString()}
							</span>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
