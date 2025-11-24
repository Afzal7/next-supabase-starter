"use client";

import { ArrowRight, Plus, Users } from "lucide-react";
import Link from "next/link";
import { CreateGroupModal } from "@/components/groups/create-group-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Group {
	id: string;
	name: string;
	group_type: string | null;
}

interface YourTeamsCardProps {
	groups: Group[];
}

export function YourTeamsCard({ groups }: YourTeamsCardProps) {
	return (
		<Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-dashed border-2 hover:border-green-500/50 group bg-gradient-to-br from-green-25/50 to-transparent">
			<CardHeader className="pb-4">
				<div className="flex items-center gap-3">
					<div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
						<Users className="h-6 w-6 text-green-600" />
					</div>
					<div>
						<CardTitle className="text-lg text-primary">Your Teams</CardTitle>
						<p className="text-sm text-secondary">
							{groups.length} active team{groups.length > 1 ? "s" : ""}
						</p>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-3">
					{groups.slice(0, 2).map((group) => (
						<Link key={group.id} href={`/dashboard/groups/${group.id}`}>
							<div className="flex items-center gap-3 p-3 hover:bg-white/60 rounded-lg cursor-pointer transition-colors border">
								<div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
									<Users className="h-4 w-4 text-primary" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-primary truncate">
										{group.name}
									</p>
									<p className="text-xs text-secondary capitalize">
										{group.group_type}
									</p>
								</div>
								<ArrowRight className="h-4 w-4 text-muted-foreground" />
							</div>
						</Link>
					))}
				</div>
				{groups.length === 0 && (
					<CreateGroupModal>
						<Button variant="outline" className="w-full">
							<Plus className="h-4 w-4 mr-2" />
							New Team
						</Button>
					</CreateGroupModal>
				)}
			</CardContent>
		</Card>
	);
}
