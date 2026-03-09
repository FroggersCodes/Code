"use client";

interface RetroButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "success" | "error" | "warning";
  disabled?: boolean;
  className?: string;
}

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
      className={`nes-btn is-${variant} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
