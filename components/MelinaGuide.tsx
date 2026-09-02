export type MelinaPose =
  | "waving"
  | "pointing"
  | "thinking"
  | "celebrating"
  | "sleeping";

const POSE_IMAGES: Record<MelinaPose, string> = {
  waving: "/melina/melina-waving.png",
  pointing: "/melina/melina-pointing.png",
  thinking: "/melina/melina-thinking.png",
  celebrating: "/melina/melina-celebrating.png",
  sleeping: "/melina/melina-sleeping.png",
};

export default function MelinaGuide({
  pose,
  message,
  className = "",
}: {
  pose: MelinaPose;
  message: string;
  className?: string;
}) {
  return (
    <div className={`flex items-end gap-2 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={POSE_IMAGES[pose]}
        alt="Melina, your garden guide"
        className="h-20 w-auto shrink-0 object-contain"
      />
      <div className="relative rounded-2xl rounded-bl-sm bg-bg-soft px-4 py-3">
        <p className="font-body text-sm text-forest/80">{message}</p>
      </div>
    </div>
  );
}
