"use client";

import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActionsCard() {
	return (
		<Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-dashed border-2 hover:border-violet-500/50 group bg-gradient-to-br from-violet-50/50 to-transparent">
			<CardHeader className="pb-4">
				<div className="flex items-center gap-3">
					<div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center group-hover:bg-violet-100 transition-colors">
						<Zap className="h-6 w-6 text-violet-600" />
					</div>
					<div>
						<CardTitle className="text-lg text-primary">
							Quick Actions
						</CardTitle>
						<p className="text-sm text-secondary">Common tasks and shortcuts</p>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground mb-4">
					Access frequently used features and perform common tasks quickly with
					these shortcuts.
				</p>
				<Button
					variant="outline"
					className="w-full group-hover:bg-violet-50 group-hover:border-violet-200 hover:scale-105 active:scale-95 transition-all duration-200 ease-out"
				>
					<Zap className="h-4 w-4 mr-2" />
					View Actions
					<ArrowRight className="h-4 w-4 ml-2" />
				</Button>
			</CardContent>
		</Card>
	);
}
