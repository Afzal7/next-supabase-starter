"use client";

import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
	icon: ComponentType<Record<string, unknown>>;
	title: string;
	description: string;
	action?: {
		label: string;
		onClick: () => void;
	};
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	action,
}: EmptyStateProps) {
	return (
		<Card className="shadow-sm">
			<CardContent className="p-12 text-center space-y-4">
				<div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
					<Icon className="h-8 w-8 text-primary" />
				</div>
				<div>
					<h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
					<p className="text-secondary mb-6">{description}</p>
					{action && (
						<Button
							className="bg-primary hover:bg-primary/90"
							onClick={action.onClick}
						>
							{action.label}
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
