"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInProps {
	children: ReactNode;
	className?: string;
	delay?: number;
	duration?: number;
}

interface FadeInRightProps {
	children: ReactNode;
	className?: string;
	delay?: number;
	duration?: number;
}

// Simple fade-in (opacity only) for global use
export function FadeIn({
	children,
	className = "",
	delay = 0,
	duration = 0.3,
}: FadeInProps) {
	return (
		<motion.div
			className={className}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{
				duration,
				delay,
				ease: [0.0, 0.0, 0.2, 1],
			}}
		>
			{children}
		</motion.div>
	);
}

// Fade-in from left to right for dashboard pages
export function FadeInRight({
	children,
	className = "",
	delay = 0,
	duration = 0.5,
}: FadeInRightProps) {
	return (
		<motion.div
			className={className}
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{
				duration,
				delay,
				ease: [0.0, 0.0, 0.2, 1],
			}}
		>
			{children}
		</motion.div>
	);
}
