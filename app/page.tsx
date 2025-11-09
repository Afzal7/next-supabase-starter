import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js App",
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Welcome to Next.js</h1>
      <p className="mt-4 text-lg">Get started by editing app/page.tsx</p>
    </main>
  );
}
