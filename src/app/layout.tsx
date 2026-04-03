import type { Metadata } from "next";
import "@/styles/globals.css";
import { BottomNav } from "@/components/BottomNav";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "DC Movie Club",
  description: "A community of film lovers in Washington, DC.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <main className="pb-24">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
