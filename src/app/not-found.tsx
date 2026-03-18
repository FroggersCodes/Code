import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="text-6xl font-bold" style={{ color: "#00ff41", fontFamily: "monospace" }}>
        404
      </div>
      <div style={{ color: "#00ff41", fontFamily: "monospace" }} className="text-xl">
        PAGE NOT FOUND
      </div>
      <p className="text-gray-400" style={{ fontFamily: "monospace" }}>
        This page does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 border text-sm"
        style={{ borderColor: "#00ff41", color: "#00ff41", fontFamily: "monospace" }}
      >
        RETURN HOME
      </Link>
    </div>
  );
}
