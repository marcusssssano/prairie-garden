"use client";

import { useEffect, useRef } from "react";

type RGB = { r: number; g: number; b: number };

// Samples the four corners of a frame to find the actual screen color,
// rather than assuming a fixed green — corner pixels are background in
// any reasonably-framed green/blue-screen shot.
function sampleScreenColor(data: Uint8ClampedArray, width: number, height: number): RGB {
  const corners = [
    0,
    (width - 1) * 4,
    (height - 1) * width * 4,
    ((height - 1) * width + width - 1) * 4,
  ];
  let r = 0;
  let g = 0;
  let b = 0;
  for (const i of corners) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  return { r: r / 4, g: g / 4, b: b / 4 };
}

// Plays a green-screen video and renders it to a canvas with the screen
// color keyed out in real time (per-pixel, every frame) — this is how we
// get a genuinely transparent "floating" video, since <video> itself
// can't have a transparent background for a standard mp4.
//
// Keys by distance to the *sampled* screen color (taken from the video's
// own corners) rather than a generic "is this pixel green" heuristic —
// the latter also strips out anything else green in frame, like a
// character's green hair, which isn't the screen at all.
export default function ChromaKeyVideo({
  src,
  className = "",
  threshold = 60,
  softness = 40,
}: {
  src: string;
  className?: string;
  threshold?: number;
  softness?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keyColorRef = useRef<RGB | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    function renderFrame() {
      if (!video || !canvas || !ctx) return;
      if (video.readyState < video.HAVE_CURRENT_DATA || !video.videoWidth) {
        return;
      }
      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = frame.data;

      if (!keyColorRef.current) {
        keyColorRef.current = sampleScreenColor(
          data,
          canvas.width,
          canvas.height
        );
      }
      const key = keyColorRef.current;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const distance = Math.sqrt(
          (r - key.r) ** 2 + (g - key.g) ** 2 + (b - key.b) ** 2
        );
        if (distance < threshold) {
          data[i + 3] = 0;
        } else if (distance < threshold + softness) {
          const alpha = (distance - threshold) / softness;
          data[i + 3] = Math.max(0, Math.min(255, alpha * 255));
        }
      }
      ctx.putImageData(frame, 0, 0);
    }

    video.play().catch(() => {
      // Autoplay can be blocked before user interaction on some browsers —
      // the loop below just keeps waiting for readyState to catch up once
      // playback does start.
    });

    // setInterval rather than requestAnimationFrame — rAF is spec'd to
    // pause in backgrounded/non-visible tabs, which would freeze the last
    // frame instead of just rendering less often.
    const intervalId = setInterval(renderFrame, 1000 / 30);

    return () => clearInterval(intervalId);
  }, [threshold, softness]);

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="absolute h-px w-px -left-[9999px] overflow-hidden"
        aria-hidden="true"
      />
      <canvas ref={canvasRef} className={className} />
    </>
  );
}
