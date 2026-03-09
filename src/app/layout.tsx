import type { Metadata } from "next";
import "./globals.css";
import "nes.css/css/nes.min.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "BugRacer - Competitive Bug Fixing Game",
  description: "Race to fix the bugs! Competitive coding game with ELO matchmaking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen pt-16">{children}</main>
      </body>
    </html>
  );
}
