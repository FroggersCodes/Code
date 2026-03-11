"use client";

import { useEffect, useRef } from "react";

const CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*<>/\\|{}[]";

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const FONT_SIZE = 14;
    let columns: number[] = [];
    let animationId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const numCols = Math.floor(canvas.width / FONT_SIZE);
      columns = Array.from({ length: numCols }, () =>
        Math.floor(Math.random() * -(canvas.height / FONT_SIZE))
      );
    };

    const draw = () => {
      // Dark translucent overlay creates the fade trail
      ctx.fillStyle = "rgba(5, 5, 8, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FONT_SIZE}px 'Share Tech Mono', monospace`;

      for (let i = 0; i < columns.length; i++) {
        const y = columns[i] * FONT_SIZE;
        if (y < 0) {
          columns[i]++;
          continue;
        }

        const char = CHARS[Math.floor(Math.random() * CHARS.length)];

        // Draw the trail character in red so it fades red → dark via the overlay
        ctx.fillStyle = "#cc0020";
        ctx.shadowBlur = 0;
        ctx.fillText(char, i * FONT_SIZE, y);

        // Bright white-red head drawn one step ahead for the glowing tip
        const headChar = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillStyle = "#ffcccc";
        ctx.shadowColor = "#ff0033";
        ctx.shadowBlur = 12;
        ctx.fillText(headChar, i * FONT_SIZE, y + FONT_SIZE);
        ctx.shadowBlur = 0;

        // Advance the column
        columns[i]++;

        // Reset column when it goes off screen
        if (y > canvas.height && Math.random() > 0.975) {
          columns[i] = Math.floor(Math.random() * -20);
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.85,
      }}
    />
  );
}
