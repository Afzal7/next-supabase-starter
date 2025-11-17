"use client";

import { useParams } from "next/navigation";
import { Settings as SettingsIcon } from "@/components/animate-ui/icons/settings";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetGroupQuery } from "@/lib/rtk/api";

export default function GroupSettingsPage() {
	const params = useParams();
	const groupId = params.id as string;

	const { data: group } = useGetGroupQuery(groupId);

	if (!group) return null;

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<SettingsIcon className="h-5 w-5" animateOnHover />
						Group Settings
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-secondary">
						Group settings and configuration options will be available here.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
