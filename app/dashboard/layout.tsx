"use client";

import {
	AlertCircle,
	ChevronRight,
	ChevronsUpDown,
	SquareTerminal,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { Toaster } from "sonner";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarProvider,
	SidebarRail,
	SidebarTrigger,
} from "@/components/animate-ui/components/radix/sidebar";
import { BadgeCheck } from "@/components/animate-ui/icons/badge-check";
import { Bell } from "@/components/animate-ui/icons/bell";
import { Bot } from "@/components/animate-ui/icons/bot";
import type { IconProps } from "@/components/animate-ui/icons/icon";
import { LogOut } from "@/components/animate-ui/icons/log-out";
import { Plus } from "@/components/animate-ui/icons/plus";
import { Settings } from "@/components/animate-ui/icons/settings";
import { Users } from "@/components/animate-ui/icons/users";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/animate-ui/primitives/radix/collapsible";
import { FadeInRight } from "@/components/animations/fade-in";
import { CreateGroupModal } from "@/components/groups/create-group-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { groupConfig } from "@/config/groups";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGetGroupsQuery } from "@/lib/rtk/api";
import { createClient } from "@/lib/supabase/client";
import type { Group } from "@/types";

type NavItem = {
	title: string;
	url: string;
	icon: React.ComponentType<IconProps<string>>;
	isActive?: boolean;
	items?: { title: string; url: string }[];
};

const DATA = {
	navMain: [
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: SquareTerminal,
			isActive: true,
		},
		{
			title: groupConfig.entityNamePlural,
			url: "/dashboard",
			icon: Bot,
		},
		{
			title: "Invitations",
			url: "/dashboard/invitations",
			icon: Bell,
		},
		{
			title: "Profile",
			url: "/dashboard/profile",
			icon: BadgeCheck,
		},
		{
			title: "Settings",
			url: "/dashboard/settings",
			icon: Settings,
		},
	] as NavItem[],
};

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const isMobile = useIsMobile();
	const router = useRouter();

	const [user, setUser] = React.useState<{
		name?: string;
		email?: string;
		avatar?: string;
	} | null>(null);
	const pathname = usePathname();
	const [activeGroup, setActiveGroup] = React.useState<Group | null>(null);
	const [showCreateModal, setShowCreateModal] = React.useState(false);

	const { data: groupsResponse, isLoading: groupsLoading } = useGetGroupsQuery({
		page: 1,
		limit: 20,
	});
	const groups = groupsResponse?.data || [];

	React.useEffect(() => {
		const getUser = async () => {
			const supabase = createClient();
			const {
				data: { user: authUser },
			} = await supabase.auth.getUser();
			if (authUser) {
				setUser({
					name: authUser.user_metadata?.name || authUser.email?.split("@")[0],
					email: authUser.email,
					avatar: authUser.user_metadata?.avatar_url,
				});
			}
		};
		getUser();
	}, []);

	React.useEffect(() => {
		if (groups.length > 0 && !activeGroup) {
			setActiveGroup(groups[0]);
		}
	}, [groups, activeGroup]);

	const handleLogout = async () => {
		const supabase = createClient();
		await supabase.auth.signOut();
		router.push("/auth/login");
	};

	return (
		<>
			<SidebarProvider>
				<Sidebar collapsible="icon">
					<SidebarHeader>
						{/* Group Switcher */}
						<SidebarMenu>
							<SidebarMenuItem>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<SidebarMenuButton
											size="lg"
											className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
										>
											<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
												<Bot className="size-4" animateOnHover />
											</div>
											<div className="grid flex-1 text-left text-sm leading-tight">
												<span className="truncate font-semibold">
													{activeGroup?.name ||
														(groups.length === 0
															? `No ${groupConfig.entityNamePlural.toLowerCase()}`
															: groupConfig.entityName)}
												</span>
												<span className="truncate text-xs">
													{activeGroup?.group_type ||
														(groups.length === 0
															? "Create one below"
															: "Management")}
												</span>
											</div>
											<ChevronsUpDown className="ml-auto" />
										</SidebarMenuButton>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
										align="start"
										side={isMobile ? "bottom" : "right"}
										sideOffset={4}
									>
										<DropdownMenuLabel className="text-xs text-muted-foreground">
											{groupConfig.entityNamePlural}
										</DropdownMenuLabel>
										{groupsLoading ? (
											<div className="p-2">
												<div className="flex items-center gap-2 p-2">
													<div className="size-6 animate-pulse rounded-sm bg-muted" />
													<div className="h-4 w-24 animate-pulse rounded bg-muted" />
												</div>
												<div className="flex items-center gap-2 p-2">
													<div className="size-6 animate-pulse rounded-sm bg-muted" />
													<div className="h-4 w-20 animate-pulse rounded bg-muted" />
												</div>
											</div>
										) : groups.length > 0 ? (
											groups.map((group, index) => (
												<DropdownMenuItem
													key={group.id}
													onClick={() => {
														setActiveGroup(group);
														router.push(`/dashboard/groups/${group.id}`);
													}}
													className="gap-2 p-2"
												>
													<div className="flex size-6 items-center justify-center rounded-sm border">
														<Bot className="size-4 shrink-0" animateOnHover />
													</div>
													{group.name}
													<DropdownMenuShortcut>
														⌘{index + 1}
													</DropdownMenuShortcut>
												</DropdownMenuItem>
											))
										) : (
											<div className="p-2 text-center text-sm text-muted-foreground">
												No {groupConfig.entityNamePlural.toLowerCase()} found
											</div>
										)}
										<DropdownMenuSeparator />
										<DropdownMenuItem
											className="gap-2 p-2"
											onClick={() => setShowCreateModal(true)}
										>
											<div className="flex size-6 items-center justify-center rounded-md border bg-background">
												<Plus className="size-4" animateOnHover />
											</div>
											<div className="font-medium text-muted-foreground">
												Create {groupConfig.entityName}
											</div>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</SidebarMenuItem>
						</SidebarMenu>
						{/* Group Switcher */}
					</SidebarHeader>

					<SidebarContent>
						{/* Workspace Section - Only show when on group pages */}
						{pathname.startsWith("/dashboard/groups/") && activeGroup && (
							<SidebarGroup>
								<SidebarGroupLabel>Workspace</SidebarGroupLabel>
								<SidebarMenu>
									<SidebarMenuItem>
										<SidebarMenuButton
											asChild
											tooltip="Overview"
											isActive={
												pathname === `/dashboard/groups/${activeGroup.id}`
											}
										>
											<Link href={`/dashboard/groups/${activeGroup.id}`}>
												<Settings animateOnHover />
												<span>Overview</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton
											asChild
											tooltip="Members"
											isActive={
												pathname ===
												`/dashboard/groups/${activeGroup.id}/members`
											}
										>
											<Link
												href={`/dashboard/groups/${activeGroup.id}/members`}
											>
												<Users animateOnHover />
												<span>Members</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton
											asChild
											tooltip="Invitations"
											isActive={
												pathname ===
												`/dashboard/groups/${activeGroup.id}/invitations`
											}
										>
											<Link
												href={`/dashboard/groups/${activeGroup.id}/invitations`}
											>
												<AlertCircle />
												<span>Invitations</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton
											asChild
											tooltip="Settings"
											isActive={
												pathname ===
												`/dashboard/groups/${activeGroup.id}/settings`
											}
										>
											<Link
												href={`/dashboard/groups/${activeGroup.id}/settings`}
											>
												<Settings animateOnHover />
												<span>Settings</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								</SidebarMenu>
							</SidebarGroup>
						)}

						{/* Platform Section */}
						<SidebarGroup>
							<SidebarGroupLabel>Platform</SidebarGroupLabel>
							<SidebarMenu>
								{DATA.navMain
									.filter((item) => item.title !== groupConfig.entityNamePlural) // Remove groups from here since we handle it separately
									.map((item) =>
										item.items ? (
											<Collapsible
												key={item.title}
												asChild
												defaultOpen={item.isActive}
												className="group/collapsible"
											>
												<SidebarMenuItem>
													<CollapsibleTrigger asChild>
														<SidebarMenuButton
															tooltip={item.title}
															isActive={pathname === item.url}
														>
															{item.icon && <item.icon animateOnHover />}
															<span>{item.title}</span>
															<ChevronRight className="ml-auto transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90" />
														</SidebarMenuButton>
													</CollapsibleTrigger>
													<CollapsibleContent>
														<SidebarMenuSub>
															{item.items.map((subItem) => (
																<SidebarMenuSubItem key={subItem.title}>
																	<SidebarMenuSubButton asChild>
																		<a href={subItem.url}>
																			<span>{subItem.title}</span>
																		</a>
																	</SidebarMenuSubButton>
																</SidebarMenuSubItem>
															))}
														</SidebarMenuSub>
													</CollapsibleContent>
												</SidebarMenuItem>
											</Collapsible>
										) : (
											<SidebarMenuItem key={item.title}>
												<SidebarMenuButton
													asChild
													tooltip={item.title}
													isActive={pathname === item.url}
												>
													<Link href={item.url}>
														{item.icon && <item.icon animateOnHover />}
														<span>{item.title}</span>
													</Link>
												</SidebarMenuButton>
											</SidebarMenuItem>
										),
									)}
							</SidebarMenu>
						</SidebarGroup>
					</SidebarContent>
					<SidebarFooter>
						{/* Nav User */}
						<SidebarMenu>
							<SidebarMenuItem>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<SidebarMenuButton
											size="lg"
											className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
										>
											<Avatar className="h-8 w-8 rounded-lg">
												<AvatarImage src={user?.avatar} alt={user?.name} />
												<AvatarFallback className="rounded-lg">
													{user?.name?.charAt(0) ||
														user?.email?.charAt(0) ||
														"U"}
												</AvatarFallback>
											</Avatar>
											<div className="grid flex-1 text-left text-sm leading-tight">
												<span className="truncate font-semibold">
													{user?.name || "User"}
												</span>
												<span className="truncate text-xs">{user?.email}</span>
											</div>
											<ChevronsUpDown className="ml-auto size-4" />
										</SidebarMenuButton>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
										side={isMobile ? "bottom" : "right"}
										align="end"
										sideOffset={4}
									>
										<DropdownMenuLabel className="p-0 font-normal">
											<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
												<Avatar className="h-8 w-8 rounded-lg">
													<AvatarImage src={user?.avatar} alt={user?.name} />
													<AvatarFallback className="rounded-lg">
														{user?.name?.charAt(0) ||
															user?.email?.charAt(0) ||
															"U"}
													</AvatarFallback>
												</Avatar>
												<div className="grid flex-1 text-left text-sm leading-tight">
													<span className="truncate font-semibold">
														{user?.name || "User"}
													</span>
													<span className="truncate text-xs">
														{user?.email}
													</span>
												</div>
											</div>
										</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuGroup>
											<DropdownMenuItem>
												<BadgeCheck animateOnHover />
												Account
											</DropdownMenuItem>
											<DropdownMenuItem>
												<Bell animateOnHover />
												Notifications
											</DropdownMenuItem>
										</DropdownMenuGroup>
										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={handleLogout}>
											<LogOut animateOnHover />
											Log out
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</SidebarMenuItem>
						</SidebarMenu>
						{/* Nav User */}
					</SidebarFooter>
					<SidebarRail />
				</Sidebar>

				<SidebarInset>
					<header className="bg-card sticky top-0 z-50 border-b">
						<div className="mx-auto max-w-7xl flex items-center justify-between gap-6 px-4 py-2 sm:px-6">
							<div className="flex items-center gap-4">
								<SidebarTrigger />
								<Separator
									orientation="vertical"
									className="hidden h-4! sm:block"
								/>
								<Breadcrumb className="hidden sm:block">
									<BreadcrumbList>
										<BreadcrumbItem>
											<BreadcrumbLink href="/dashboard">
												Dashboard
											</BreadcrumbLink>
										</BreadcrumbItem>
										{pathname.startsWith("/dashboard/groups/") && (
											<>
												<BreadcrumbSeparator />
												<BreadcrumbItem>
													<BreadcrumbLink
														href={`/dashboard/groups/${activeGroup?.id || pathname.split("/")[3]}`}
													>
														{activeGroup?.name || "Group"}
													</BreadcrumbLink>
												</BreadcrumbItem>
												{pathname.includes("/members") && (
													<>
														<BreadcrumbSeparator />
														<BreadcrumbItem>
															<BreadcrumbPage>Members</BreadcrumbPage>
														</BreadcrumbItem>
													</>
												)}
												{pathname.includes("/invitations") && (
													<>
														<BreadcrumbSeparator />
														<BreadcrumbItem>
															<BreadcrumbPage>Invitations</BreadcrumbPage>
														</BreadcrumbItem>
													</>
												)}
												{pathname.includes("/settings") && (
													<>
														<BreadcrumbSeparator />
														<BreadcrumbItem>
															<BreadcrumbPage>Settings</BreadcrumbPage>
														</BreadcrumbItem>
													</>
												)}
											</>
										)}
										{pathname === "/dashboard/invitations" && (
											<>
												<BreadcrumbSeparator />
												<BreadcrumbItem>
													<BreadcrumbPage>Invitations</BreadcrumbPage>
												</BreadcrumbItem>
											</>
										)}
										{pathname === "/dashboard/profile" && (
											<>
												<BreadcrumbSeparator />
												<BreadcrumbItem>
													<BreadcrumbPage>Profile</BreadcrumbPage>
												</BreadcrumbItem>
											</>
										)}
										{pathname === "/dashboard/settings" && (
											<>
												<BreadcrumbSeparator />
												<BreadcrumbItem>
													<BreadcrumbPage>Settings</BreadcrumbPage>
												</BreadcrumbItem>
											</>
										)}
										{!pathname.startsWith("/dashboard/groups/") &&
											!pathname.includes("/invitations") &&
											!pathname.includes("/profile") &&
											!pathname.includes("/settings") && (
												<>
													<BreadcrumbSeparator />
													<BreadcrumbItem>
														<BreadcrumbPage>
															{activeGroup?.name ||
																(groups.length === 0
																	? "No " +
																		groupConfig.entityNamePlural.toLowerCase()
																	: groupConfig.entityNamePlural)}
														</BreadcrumbPage>
													</BreadcrumbItem>
												</>
											)}
									</BreadcrumbList>
								</Breadcrumb>
							</div>
							<div className="flex items-center gap-1.5">
								{/* <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={DATA.user.avatar} alt={DATA.user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar> */}
							</div>
						</div>
					</header>
					<main className="mx-auto size-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
						<FadeInRight key={pathname}>{children}</FadeInRight>
					</main>

					{/* <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div> */}
				</SidebarInset>

				<CreateGroupModal
					open={showCreateModal}
					onOpenChange={setShowCreateModal}
				/>
			</SidebarProvider>
			<Toaster />
		</>
	);
}
