"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="text-6xl font-bold" style={{ color: "#ff0040", fontFamily: "monospace" }}>
        ERROR
      </div>
      <p className="text-gray-400" style={{ fontFamily: "monospace" }}>
        Something went wrong. Please try again.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-6 py-3 border text-sm"
          style={{ borderColor: "#00ff41", color: "#00ff41", fontFamily: "monospace" }}
        >
          TRY AGAIN
        </button>
        <Link
          href="/"
          className="px-6 py-3 border text-sm"
          style={{ borderColor: "#555", color: "#aaa", fontFamily: "monospace" }}
        >
          RETURN HOME
        </Link>
      </div>
    </div>
  );
}
