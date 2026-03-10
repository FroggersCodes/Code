"use client";

interface RetroButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "success" | "error" | "warning";
  disabled?: boolean;
  className?: string;
}

const variantStyles: Record<string, string> = {
  primary:
    "bg-transparent border-[var(--accent-red)] text-[var(--accent-red)] hover:bg-[var(--accent-red)] hover:text-black",
  success:
    "bg-[var(--accent-red)] border-[var(--accent-red)] text-black hover:bg-[var(--accent-red-bright)] hover:shadow-[0_0_20px_var(--accent-red-glow)]",
  error:
    "bg-transparent border-[var(--text-dim)] text-[var(--text-dim)] hover:border-[var(--accent-red)] hover:text-[var(--accent-red)]",
  warning:
    "bg-transparent border-[var(--accent-yellow)] text-[var(--accent-yellow)] hover:bg-[var(--accent-yellow)] hover:text-black",
};

export function RetroButton({
  children,
  onClick,
  variant = "primary",
  disabled,
  className = "",
}: RetroButtonProps) {
  return (
    <button
      type="button"
      className={`px-6 py-2.5 border font-bold text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer ${
        variantStyles[variant]
      } ${disabled ? "opacity-30 cursor-not-allowed pointer-events-none" : ""} ${className}`}
      style={{ fontFamily: "'Share Tech Mono', monospace" }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
