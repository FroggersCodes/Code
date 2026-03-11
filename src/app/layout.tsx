import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { MatrixRain } from "@/components/MatrixRain";

export const metadata: Metadata = {
  title: "BugRacer - Competitive Bug Fixing Game",
  description: "Race to fix the bugs! Competitive coding game vs bot.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MatrixRain />
        <Navbar />
        <main className="min-h-screen pt-14 relative z-10">{children}</main>
      </body>
    </html>
  );
}
