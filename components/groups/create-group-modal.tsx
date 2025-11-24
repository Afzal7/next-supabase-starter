"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FadeIn } from "@/components/animations/fade-in";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { groupConfig } from "@/config/groups";
import { useCreateGroupMutation } from "@/lib/rtk/api";

interface ApiError {
	data?: {
		error?: {
			message?: string;
		};
	};
}

interface CreateGroupModalProps {
	children?: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function CreateGroupModal({
	children,
	open: controlledOpen,
	onOpenChange,
}: CreateGroupModalProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
	const setOpen = onOpenChange || setInternalOpen;
	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [description, setDescription] = useState("");
	const [groupType, setGroupType] = useState(
		groupConfig.defaultGroupType || "organization",
	);
	const [error, setError] = useState<string | null>(null);

	const [createGroup, { isLoading }] = useCreateGroupMutation();
	const router = useRouter();

	// Auto-generate slug from name
	const handleNameChange = (value: string) => {
		setName(value);
		if (!slug || slug === generateSlug(name)) {
			setSlug(generateSlug(value));
		}
	};

	const generateSlug = (text: string) => {
		return text
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.trim();
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!name.trim()) {
			setError("Group name is required");
			return;
		}

		if (!slug.trim()) {
			setError("Group slug is required");
			return;
		}

		try {
			const result = await createGroup({
				name: name.trim(),
				slug: slug.trim(),
				description: description.trim(),
				group_type: groupType,
			}).unwrap();

			// Close modal and navigate to the new group
			setOpen(false);
			router.push(`/dashboard/groups/${result.id}`);
		} catch (error: unknown) {
			const message =
				error instanceof Error
					? error.message
					: (error as ApiError)?.data?.error?.message ||
						"Failed to create group";
			setError(message);
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		if (onOpenChange) {
			onOpenChange(newOpen);
		} else {
			setInternalOpen(newOpen);
		}
		if (!newOpen) {
			// Reset form when closing
			setName("");
			setSlug("");
			setDescription("");
			setGroupType(groupConfig.defaultGroupType || "organization");
			setError(null);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			{/* Only render trigger if children are provided OR if in uncontrolled mode */}
			{(children || (!controlledOpen && !onOpenChange)) && (
				<DialogTrigger asChild>
					{children || (
						<Button className="bg-primary hover:bg-primary/90">
							<Plus className="h-4 w-4 mr-2" />
							Create {groupConfig.entityName}
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[425px]">
				<FadeIn>
					<DialogHeader>
						<DialogTitle>Create New {groupConfig.entityName}</DialogTitle>
						<DialogDescription>
							Create a new {groupConfig.entityName.toLowerCase()} to collaborate
							with your team.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Group Name */}
						<div className="space-y-2">
							<Label
								htmlFor="name"
								className="text-sm font-medium capitalize text-tertiary"
							>
								{groupConfig.entityName} Name
							</Label>
							<Input
								id="name"
								type="text"
								placeholder={`Enter ${groupConfig.entityName.toLowerCase()} name`}
								value={name}
								onChange={(e) => handleNameChange(e.target.value)}
								required
								className="transition-all duration-normal ease-smooth focus:ring-2 focus:ring-primary/20"
							/>
						</div>

						{/* Group Slug */}
						<div className="space-y-2">
							<Label
								htmlFor="slug"
								className="text-sm font-medium capitalize text-tertiary"
							>
								{groupConfig.entityName} Slug
							</Label>
							<Input
								id="slug"
								type="text"
								placeholder={`${groupConfig.entityName.toLowerCase()}-slug`}
								value={slug}
								onChange={(e) => setSlug(e.target.value)}
								required
								className="transition-all duration-normal ease-smooth focus:ring-2 focus:ring-primary/20"
							/>
							<p className="text-xs text-muted-foreground">
								This will be used in the {groupConfig.entityName.toLowerCase()}{" "}
								URL
							</p>
						</div>

						{/* Group Type - Only show if multiple types are supported */}
						{(groupConfig.supportedGroupTypes || []).length > 1 && (
							<div className="space-y-2">
								<Label
									htmlFor="type"
									className="text-sm font-medium capitalize text-tertiary"
								>
									Type
								</Label>
								<Select value={groupType} onValueChange={setGroupType}>
									<SelectTrigger className="transition-all duration-normal ease-smooth focus:ring-2 focus:ring-primary/20">
										<SelectValue placeholder="Select group type" />
									</SelectTrigger>
									<SelectContent>
										{(
											groupConfig.supportedGroupTypes || [
												"organization",
												"team",
											]
										).map((type) => (
											<SelectItem key={type} value={type}>
												{type.charAt(0).toUpperCase() + type.slice(1)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}

						{/* Description */}
						<div className="space-y-2">
							<Label
								htmlFor="description"
								className="text-sm font-medium capitalize text-tertiary"
							>
								Description
							</Label>
							<Textarea
								id="description"
								placeholder={`Describe your ${groupConfig.entityName.toLowerCase()} (optional)`}
								value={description}
								onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
									setDescription(e.target.value)
								}
								rows={3}
								className="transition-all duration-normal ease-smooth focus:ring-2 focus:ring-primary/20"
							/>
						</div>

						{/* Error Message */}
						{error && (
							<div className="text-sm text-destructive animate-in slide-in-from-top-2 duration-normal">
								{error}
							</div>
						)}

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
								disabled={isLoading}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isLoading || !name.trim() || !slug.trim()}
								className="bg-primary hover:bg-primary/90"
							>
								{isLoading ? "Creating..." : `Create ${groupConfig.entityName}`}
							</Button>
						</DialogFooter>
					</form>
				</FadeIn>
			</DialogContent>
		</Dialog>
	);
}
