"use client";

import { ArrowRight, Mail, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Invitation {
	id: string;
	group?: {
		name?: string;
	};
	role: string;
}

interface PendingInvitationsCardProps {
	invitations: Invitation[];
}

export function PendingInvitationsCard({
	invitations,
}: PendingInvitationsCardProps) {
	return (
		<Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-dashed border-2 hover:border-blue-500/50 group bg-gradient-to-br from-blue-50/50 to-transparent">
			<CardHeader className="pb-4">
				<div className="flex items-center gap-3">
					<div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
						<Mail className="h-6 w-6 text-blue-600" />
					</div>
					<div>
						<CardTitle className="text-lg text-primary">
							Pending Invitations
						</CardTitle>
						<p className="text-sm text-secondary">
							{invitations.length} invitation{invitations.length > 1 ? "s" : ""}{" "}
							waiting
						</p>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-3">
					{invitations.slice(0, 2).map((invitation) => (
						<div
							key={invitation.id}
							className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border"
						>
							<div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
								<Users className="h-4 w-4 text-primary" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-primary truncate">
									{invitation.group?.name || "Unknown Team"}
								</p>
								<p className="text-xs text-secondary">
									Invited as {invitation.role}
								</p>
							</div>
							<div className="flex gap-1">
								<Link href={`/invitations/${invitation.id}/accept`}>
									<Button
										size="sm"
										className="h-8 px-3 bg-green-600 hover:bg-green-700"
									>
										Accept
									</Button>
								</Link>
								<Link href={`/invitations/${invitation.id}/reject`}>
									<Button size="sm" variant="outline" className="h-8 px-3">
										Decline
									</Button>
								</Link>
							</div>
						</div>
					))}
				</div>
				{invitations.length > 2 && (
					<Link href={`/dashboard/invitations`}>
						<Button variant="outline" className="w-full">
							View All Invitations
							<ArrowRight className="h-4 w-4 ml-2" />
						</Button>
					</Link>
				)}
			</CardContent>
		</Card>
	);
}
