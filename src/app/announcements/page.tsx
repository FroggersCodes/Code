"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RetroButton } from "@/components/RetroButton";

interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    import("@/lib/socket").then(({ connectSocket }) => {
      const socket = connectSocket();

      const timeout = setTimeout(() => {
        setLoading(false);
      }, 5000);

      socket.on("announcements:data", (data: Announcement[]) => {
        clearTimeout(timeout);
        setAnnouncements(data);
        setLoading(false);
      });

      if (socket.connected) {
        socket.emit("announcements:get");
      } else {
        socket.on("connect", () => {
          clearTimeout(timeout);
          socket.emit("announcements:get");
        });
      }

      return () => {
        clearTimeout(timeout);
        socket.off("announcements:data");
      };
    });
  }, []);

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] px-3 sm:px-4 py-6 sm:py-8">
      <h1
        className="text-lg text-[var(--accent-red)] glow-red mb-6 tracking-widest font-bold"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        ANNOUNCEMENTS
      </h1>

      <div className="w-full max-w-lg">
        {loading && (
          <div className="hacker-card hacker-card-red text-center">
            <div className="text-xs text-[var(--accent-red)] tracking-wider pulse-glow">
              LOADING...
            </div>
          </div>
        )}

        {!loading && announcements.length === 0 && (
          <div className="hacker-card hacker-card-red text-center">
            <div className="text-xs text-[var(--text-muted)]">
              No announcements yet. Check back later!
            </div>
          </div>
        )}

        {!loading && announcements.length > 0 && (
          <div className="space-y-4">
            {announcements.map((a, i) => (
              <div
                key={a.id}
                className="hacker-card"
                style={{
                  borderColor: i === 0 ? "rgba(0,212,255,0.4)" : undefined,
                  boxShadow: i === 0 ? "0 0 12px rgba(0,212,255,0.15)" : undefined,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="text-xs font-bold tracking-wider"
                    style={{
                      color: i === 0 ? "#00d4ff" : "var(--text-primary)",
                      fontFamily: "'Orbitron', sans-serif",
                    }}
                  >
                    {a.title}
                  </div>
                  {i === 0 && (
                    <span className="text-[9px] text-[#00d4ff] tracking-widest border border-[#00d4ff] border-opacity-40 px-1.5 py-0.5 rounded">
                      NEW
                    </span>
                  )}
                </div>
                <div className="text-xs text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap mb-2">
                  {a.body}
                </div>
                <div className="text-[9px] text-[var(--text-muted)] tracking-wider">
                  {new Date(a.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <RetroButton variant="primary" onClick={() => router.push("/")}>
            BACK TO HOME
          </RetroButton>
        </div>
      </div>
    </div>
  );
}
