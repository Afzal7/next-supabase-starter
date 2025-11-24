"use client";

import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GettingStartedActivityCardProps {
	hasTeams: boolean;
}

export function GettingStartedActivityCard({
	hasTeams,
}: GettingStartedActivityCardProps) {
	return (
		<Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-dashed border-2 hover:border-indigo-500/50 group bg-gradient-to-br from-indigo-50/50 to-transparent">
			<CardHeader className="pb-4">
				<div className="flex items-center gap-3">
					<div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
						<Calendar className="h-6 w-6 text-indigo-600" />
					</div>
					<div>
						<CardTitle className="text-lg text-primary">
							{hasTeams ? "Team Activity" : "Getting Started"}
						</CardTitle>
						<p className="text-sm text-secondary">
							{hasTeams
								? "Recent updates from your teams"
								: "Your journey begins here"}
						</p>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground">
					{hasTeams
						? "Recent team updates and activities will appear here..."
						: "Welcome! Start by creating your first team or exploring features."}
				</p>
			</CardContent>
		</Card>
	);
}
