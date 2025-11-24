"use client";

import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ExploreFeaturesCard() {
	return (
		<Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-dashed border-2 hover:border-purple-500/50 group bg-gradient-to-br from-purple-50/50 to-transparent">
			<CardHeader className="pb-4">
				<div className="flex items-center gap-3">
					<div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
						<FileText className="h-6 w-6 text-purple-600" />
					</div>
					<div>
						<CardTitle className="text-lg text-primary">
							Explore Features
						</CardTitle>
						<p className="text-sm text-secondary">Discover what you can do</p>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground mb-4">
					Learn about team collaboration, project management, and productivity
					tools available on our platform.
				</p>
				<Button
					variant="outline"
					className="w-full group-hover:bg-purple-50 group-hover:border-purple-200"
				>
					<FileText className="h-4 w-4 mr-2" />
					View Features
					<ArrowRight className="h-4 w-4 ml-2" />
				</Button>
			</CardContent>
		</Card>
	);
}
