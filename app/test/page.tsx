"use client";

import { RTKTestComponent } from "@/components/rtk-test";

export default function TestPage() {
	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold mb-4">RTK Query Test</h1>
			<p className="mb-4 text-gray-600">
				This page tests if your RTK Query setup is working correctly. Make sure
				you're logged in and have run the database migrations.
			</p>
			<RTKTestComponent />
		</div>
	);
}
