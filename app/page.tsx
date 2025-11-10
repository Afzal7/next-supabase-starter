import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Welcome",
  description: "Get started with your account",
};

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 md:py-12 lg:py-16">
      <div className="w-full max-w-sm md:max-w-lg lg:max-w-2xl">
        <div className="text-center space-y-6">
          {/* Hero Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-primary leading-tight">
            Welcome to Your App
          </h1>

          {/* Subtitle */}
          <p className="text-base text-secondary max-w-md mx-auto leading-relaxed">
            Create your account to get started and manage your groups with ease.
          </p>

          {/* CTA Button */}
          <div className="pt-2">
            <Button asChild size="lg" className="w-full md:w-auto px-8 py-3">
              <Link href="/auth/sign-up">
                Get Started
              </Link>
            </Button>
          </div>

          {/* Login Link */}
          <div className="pt-4">
            <Link
              href="/auth/login"
              className="text-primary hover:underline text-sm font-medium"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
