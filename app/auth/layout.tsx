"use client";

import { usePathname } from "next/navigation";
import { FadeIn } from "@/components/animations/fade-in";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();

	return <FadeIn key={pathname}>{children}</FadeIn>;
}
