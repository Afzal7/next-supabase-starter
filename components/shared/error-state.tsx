"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
	message: string;
	onRetry?: () => void;
	retryLabel?: string;
}

export function ErrorState({
	message,
	onRetry,
	retryLabel = "Try again",
}: ErrorStateProps) {
	return (
		<Alert variant="destructive">
			<AlertCircle className="h-4 w-4" />
			<AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
				<span>{message}</span>
				{onRetry && (
					<Button
						variant="outline"
						size="sm"
						onClick={onRetry}
						className="self-start sm:self-auto"
					>
						<RefreshCw className="h-4 w-4 mr-2" />
						{retryLabel}
					</Button>
				)}
			</AlertDescription>
		</Alert>
	);
}
