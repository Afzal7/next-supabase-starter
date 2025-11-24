"use client";

import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CreatePostCard() {
	return (
		<Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-dashed border-2 hover:border-blue-500/50 group bg-gradient-to-br from-blue-50/50 to-transparent">
			<CardHeader className="pb-4">
				<div className="flex items-center gap-3">
					<div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
						<Plus className="h-6 w-6 text-blue-600" />
					</div>
					<div>
						<CardTitle className="text-lg text-primary">Create Post</CardTitle>
						<p className="text-sm text-secondary">
							Share knowledge and updates with your team
						</p>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground mb-4">
					Create and share posts, updates, and announcements with your team to
					keep everyone informed and engaged.
				</p>
				<Button
					variant="outline"
					className="w-full group-hover:bg-blue-50 group-hover:border-blue-200"
				>
					<Plus className="h-4 w-4 mr-2" />
					Create Post
					<ArrowRight className="h-4 w-4 ml-2" />
				</Button>
			</CardContent>
		</Card>
	);
}
