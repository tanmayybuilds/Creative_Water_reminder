import { Smile, AlertTriangle, Flame, Skull } from "lucide-react";
import type { RoastIntensity } from "@/types";

export interface RoastOption {
  intensity: RoastIntensity;
  label: string;
  description: string;
  icon: typeof Smile;
}

export const ROAST_OPTIONS: RoastOption[] = [
  {
    intensity: "chill",
    label: "Chill",
    description: "Keep it supportive.",
    icon: Smile,
  },
  {
    intensity: "serious",
    label: "Serious",
    description: "Call me out when I try to escape.",
    icon: AlertTriangle,
  },
  {
    intensity: "savage",
    label: "Savage",
    description: "Don\u2019t let me make excuses.",
    icon: Flame,
  },
  {
    intensity: "brainrot",
    label: "Brainrot",
    description: "Absolutely unhinged.",
    icon: Skull,
  },
];

export const ROAST_LABELS: Record<RoastIntensity, string> = {
  chill: "Chill",
  serious: "Serious",
  savage: "Savage",
  brainrot: "Brainrot",
};
