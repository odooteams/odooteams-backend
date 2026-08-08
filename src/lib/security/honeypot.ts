import type { CSSProperties } from "react";

// Visually hidden honeypot styles — invisible to humans, picked up by bots.
export const honeypotStyle: CSSProperties = {
  position: "absolute",
  left: "-9999px",
  top: "auto",
  width: "1px",
  height: "1px",
  overflow: "hidden",
  opacity: 0,
  pointerEvents: "none",
};
