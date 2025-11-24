"use client";

import { ArrowRight, Plus, Users } from "lucide-react";
import { CreateGroupModal } from "@/components/groups/create-group-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { groupConfig } from "@/config/groups";

export function CreateFirstTeamCard() {
	return (
		<Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-dashed border-2 hover:border-primary/50 group bg-gradient-to-br from-primary-50/50 to-transparent">
			<CardHeader className="pb-4">
				<div className="flex items-center gap-3">
					<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
						<Users className="h-6 w-6 text-primary" />
					</div>
					<div>
						<CardTitle className="text-lg text-primary">
							Create Your First Team
						</CardTitle>
						<p className="text-sm text-secondary">
							Start collaborating with others
						</p>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground mb-4">
					Build your team, manage projects, and achieve more together. Create
					your first {groupConfig.entityName.toLowerCase()} to get started.
				</p>
				<CreateGroupModal>
					<Button className="w-full bg-primary hover:bg-primary/90 group-hover:shadow-md">
						<Plus className="h-4 w-4 mr-2" />
						Create {groupConfig.entityName}
						<ArrowRight className="h-4 w-4 ml-2" />
					</Button>
				</CreateGroupModal>
			</CardContent>
		</Card>
	);
}
