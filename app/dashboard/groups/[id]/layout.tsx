"use client";

import { AlertCircle, Calendar } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { groupConfig } from "@/config/groups";
import { useGetGroupQuery } from "@/lib/rtk/api";
import { InviteMemberModal } from "./_components/InviteMemberModal";

interface GroupLayoutProps {
	children: React.ReactNode;
}

export default function GroupLayout({ children }: GroupLayoutProps) {
	const params = useParams();
	const groupId = params.id as string;

	const {
		data: group,
		isLoading: groupLoading,
		error: groupError,
	} = useGetGroupQuery(groupId);
	const isLoading = groupLoading;
	const error = groupError;

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div className="space-y-2">
						<Skeleton className="h-8 w-64" />
						<Skeleton className="h-4 w-96" />
					</div>
					<Skeleton className="h-10 w-32" />
				</div>
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (error || !group) {
		return (
			<div className="space-y-6">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						{error
							? `Failed to load ${groupConfig.entityName.toLowerCase()} details.`
							: `${groupConfig.entityName} not found.`}
					</AlertDescription>
				</Alert>
				<div className="text-center">
					<Link href="/dashboard">
						<Button variant="outline">Back to Dashboard</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			{/* <div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-primary capitalize">
						{group.name}
					</h1>
					{group.description && (
						<p className="text-secondary mt-1">{group.description}</p>
					)}
					<div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
						<span className="flex items-center gap-1">
							<Calendar className="h-4 w-4" />
							Created{" "}
							{group.created_at
								? new Date(group.created_at as string).toLocaleDateString()
								: "Unknown"}
						</span>
					</div>
				</div>
				<div className="flex gap-2">
					<InviteMemberModal groupId={groupId} />
				</div>
			</div> */}

			{/* Page Content */}
			{children}
		</div>
	);
}
