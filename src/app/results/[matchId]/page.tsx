"use client";

import { useRouter } from "next/navigation";

export default function ResultsPage() {
  const router = useRouter();

  // Results are shown inline in the game page via the ResultsScreen component
  // This page is a fallback redirect
  router.push("/lobby");

  return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
      <div className="text-[var(--neon-blue)] pulse-neon">REDIRECTING...</div>
    </div>
  );
}
