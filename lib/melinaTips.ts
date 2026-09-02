import type { CareLevel, LightNeeds } from "@/lib/types";

const CARE_TIPS: Record<CareLevel, string> = {
  Easy: "This one's forgiving — water when the top inch of soil feels dry, and it'll be fine if you forget a week.",
  Moderate: "Keep an eye on the soil moisture and give it a consistent spot — it likes routine more than attention.",
  Fussy: "This one's a bit particular — check on it every few days and avoid moving it around once it's settled.",
};

const LIGHT_TIPS: Record<LightNeeds, string> = {
  "Low Light": "Happy a few feet back from a window, or in a room with no direct sun at all.",
  "Bright Indirect": "Give it a spot near a window, just out of direct sun.",
  "Full Sun": "It wants direct sun for several hours a day — a south-facing windowsill is ideal.",
};

export function getMelinaCareTip(
  careLevel: CareLevel | null,
  lightNeeds: LightNeeds | null
) {
  const careTip = careLevel ? CARE_TIPS[careLevel] : null;
  const lightTip = lightNeeds ? LIGHT_TIPS[lightNeeds] : null;

  if (careTip && lightTip) return `${careTip} ${lightTip}`;
  return careTip ?? lightTip ?? "I don't have a tip for this one yet — but it's a lovely pick!";
}
