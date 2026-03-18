import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { MatrixRain } from "@/components/MatrixRain";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bugracer.gg";

export const metadata: Metadata = {
  title: "BugRacer - Competitive Bug Fixing Game",
  description: "Race against other developers to fix bugs faster. Earn ELO, climb the leaderboard, and prove you're the best debugger.",
  metadataBase: new URL(appUrl),
  openGraph: {
    title: "BugRacer - Competitive Bug Fixing Game",
    description: "Race against other developers to fix bugs faster. Earn ELO, climb the leaderboard, and prove you're the best debugger.",
    url: appUrl,
    siteName: "BugRacer",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "BugRacer - Competitive Bug Fixing Game",
    description: "Race against other developers to fix bugs faster.",
  },
  icons: {
    icon: "/favicon.svg",
  },
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
