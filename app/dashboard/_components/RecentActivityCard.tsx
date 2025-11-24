"use client";

import { Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RecentActivityCard() {
	return (
		<Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-dashed border-2 hover:border-teal-500/50 group bg-gradient-to-br from-teal-50/50 to-transparent">
			<CardHeader className="pb-4">
				<div className="flex items-center gap-3">
					<div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center group-hover:bg-teal-100 transition-colors">
						<Activity className="h-6 w-6 text-teal-600" />
					</div>
					<div>
						<CardTitle className="text-lg text-primary">
							Recent Activity
						</CardTitle>
						<p className="text-sm text-secondary">
							Latest updates and posts from your teams
						</p>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground mb-4">
					Stay updated with the latest posts, comments, and team activities
					across all your workspaces.
				</p>
				<Button
					variant="outline"
					className="w-full group-hover:bg-teal-50 group-hover:border-teal-200 hover:scale-105 active:scale-95 transition-all duration-200 ease-out"
				>
					<Activity className="h-4 w-4 mr-2" />
					View Activity Feed
					<ArrowRight className="h-4 w-4 ml-2" />
				</Button>
			</CardContent>
		</Card>
	);
}
