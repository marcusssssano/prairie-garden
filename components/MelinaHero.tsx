"use client";

import { useEffect, useRef, useState } from "react";
import ChromaKeyVideo from "@/components/ChromaKeyVideo";

const MELINA_VIDEO = "/melina/melina-wave-greenscreen.mp4";

const GREETINGS = [
  "Omg, welcome! 🌿",
  "Ooh, a new friend! Need help finding a plant?",
  "Hi hi! I'm Melina, your garden guide.",
  "Yay, you're here! Let's find your next favorite plant.",
  "Psst — the Shop link up top has all my favorites.",
];

export default function MelinaHero() {
  const [message, setMessage] = useState<string | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, []);

  function handleClick() {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setMessage(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
    dismissTimer.current = setTimeout(() => setMessage(null), 5000);
  }

  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[380px] items-center justify-center md:flex">
      <div className="pointer-events-auto relative">
        {/* Her "stage" — an organic blob so she reads as standing in a
            spot, not pasted onto empty background. */}
        <div
          className="absolute left-1/2 top-1/2 h-80 w-72 -translate-x-1/2 -translate-y-1/2 rounded-organic bg-sage/25"
          aria-hidden="true"
        />
        <div
          className="absolute left-1/2 top-[58%] h-64 w-56 -translate-x-1/2 -translate-y-1/2 rounded-organic bg-melina-teal/10"
          aria-hidden="true"
        />

        {message && (
          <div className="absolute left-1/2 top-[62%] w-[170px] translate-x-[55px] -translate-y-1/2 rounded-2xl rounded-tl-sm bg-bg-soft px-4 py-3 shadow-lg">
            <p className="font-body text-sm text-forest/80">{message}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleClick}
          aria-label="Say hi to Melina"
          className="relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-clay"
        >
          <ChromaKeyVideo
            src={MELINA_VIDEO}
            className="relative h-96 w-auto drop-shadow-xl"
          />
          {/* Grounding shadow at her feet, so she reads as standing rather
              than floating. */}
          <div
            className="absolute bottom-3 left-1/2 h-4 w-32 -translate-x-1/2 rounded-full bg-forest/20 blur-md"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}
