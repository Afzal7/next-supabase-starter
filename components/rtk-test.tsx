"use client";

// Test component to verify RTK Query setup
import { useGetGroupsQuery } from "@/lib/rtk";

export function RTKTestComponent() {
	const {
		data: groups,
		isLoading,
		error,
	} = useGetGroupsQuery({ page: 1, limit: 5 });

	if (isLoading) return <div>Loading groups...</div>;
	if (error) return <div>Error: {JSON.stringify(error)}</div>;

	return (
		<div>
			<h2>RTK Query Test</h2>
			<p>Groups loaded: {groups?.data?.length || 0}</p>
			{groups?.data?.map((group) => (
				<div key={group.id}>
					{group.name} - {group.slug}
				</div>
			))}
		</div>
	);
}
