export const MONEY_REACTIONS = [
  "Financially responsible. Suspicious.",
  "Bro chose the bag.",
  "At least you\u2019re honest about what motivates you.",
  "The accountant inside you won.",
  "Respect. Generational wealth over temporary clout.",
  "Compound interest > Followers. Solid logic.",
  "Bag secured. Now if only you secured this focus session.",
  "Direct and pragmatic. Money talks.",
];

export const FAME_REACTIONS = [
  "Main character detected.",
  "Bro wants the spotlight and the paparazzi.",
  "Influencer arc officially unlocked.",
  "Okay, celebrity. Where should we send the autograph requests?",
  "Living purely for the blue checkmark.",
  "Viral sensation in the making.",
  "The red carpet awaits. Don\u2019t forget the little people.",
  "Clout over capital. Bold choice.",
];

export function getRandomReaction(type: "money" | "fame", excludeReaction?: string): string {
  const pool = type === "money" ? MONEY_REACTIONS : FAME_REACTIONS;
  const filtered = pool.filter((r) => r !== excludeReaction);
  const candidates = filtered.length > 0 ? filtered : pool;
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
}
