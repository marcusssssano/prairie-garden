"use client";

import { useEffect } from "react";

// Last-resort boundary: only fires if the root layout itself throws, in
// which case the normal error boundaries (which render inside it) never
// get the chance. It replaces the whole document, so it has to bring its
// own <html>/<body> and can't rely on the app's fonts or Tailwind layer.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root layout error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          color: "#3d4a31",
          fontFamily: "system-ui, -apple-system, sans-serif",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 500, margin: 0 }}>
            Prairie Garden ran into a problem
          </h1>
          <p style={{ marginTop: "0.5rem", color: "#3d4a3199" }}>
            Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 2rem",
              borderRadius: "9999px",
              border: "none",
              background: "#c98b5b",
              color: "#ffffff",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
