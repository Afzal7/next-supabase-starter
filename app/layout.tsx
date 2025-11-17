import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ReduxProvider } from "@/lib/rtk";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: "http://localhost:3000";

export const metadata: Metadata = {
	metadataBase: new URL(defaultUrl),
	title: "Next.js and Supabase Starter Kit",
	description: "The fastest way to build apps with Next.js and Supabase",
};

const geistSans = Nunito({
	variable: "--font-geist-sans",
	display: "swap",
	subsets: ["latin"],
	weight: ["600", "700", "800", "900"],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${geistSans.className} antialiased`}>
				<ReduxProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="light"
						enableSystem
						disableTransitionOnChange
					>
						{children}
					</ThemeProvider>
				</ReduxProvider>
			</body>
		</html>
	);
}
