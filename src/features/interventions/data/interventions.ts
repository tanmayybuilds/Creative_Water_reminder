import type { InterventionContent } from "@/types";

export const INTERVENTIONS: InterventionContent[] = [
  // ── FIRST QUIT: CHILL ──────────────────────────────────────────
  {
    id: "chill_first_1",
    stage: "first",
    intensity: ["chill"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "Don\u2019t give up yet.",
    message: "You just started getting into the zone. Take a deep breath and keep going.",
    mediaType: "text",
    tag: "supportive",
  },
  {
    id: "chill_first_2",
    stage: "first",
    intensity: ["chill"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "You\u2019ve got this.",
    message: "The hardest part is staying seated. Give it just 5 more minutes.",
    mediaType: "text",
    tag: "encouraging",
  },

  // ── FIRST QUIT: SERIOUS ────────────────────────────────────────
  {
    id: "serious_first_1",
    stage: "first",
    intensity: ["serious"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "Already quitting?",
    message: "You\u2019ve barely started. Focus mode requires commitment.",
    mediaType: "text",
    tag: "callout",
  },
  {
    id: "serious_first_2",
    stage: "first",
    intensity: ["serious"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "Second thoughts?",
    message: "Distractions are easy. Finishing what you set out to do is what counts.",
    mediaType: "text",
    tag: "discipline",
  },

  // ── FIRST QUIT: SAVAGE ─────────────────────────────────────────
  {
    id: "savage_first_1",
    stage: "first",
    intensity: ["savage"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "ALREADY QUITTING? \ud83d\udc80",
    message: "Bro clicked Lock In and immediately looked for the exit door.",
    mediaType: "text",
    tag: "savage_intro",
  },
  {
    id: "savage_first_2",
    stage: "first",
    intensity: ["savage"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "Zero discipline detected.",
    message: "You lasted less time than an unskippable YouTube ad.",
    mediaType: "text",
    tag: "attention_span",
  },

  // ── FIRST QUIT: BRAINROT ───────────────────────────────────────
  {
    id: "brainrot_first_1",
    stage: "first",
    intensity: ["brainrot"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "BRO THINKS HE CAN LEAVE \ud83d\udc80",
    message: "Negative aura detected. The timer is currently mogging you.",
    mediaType: "text",
    tag: "aura_loss",
  },

  // ── SECOND QUIT: CHILL ─────────────────────────────────────────
  {
    id: "chill_second_1",
    stage: "second",
    intensity: ["chill"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "Stay with it a little longer.",
    message: "Building momentum takes time. Push through this brief resistance.",
    mediaType: "text",
    tag: "momentum",
  },

  // ── SECOND QUIT: SERIOUS ───────────────────────────────────────
  {
    id: "serious_second_1",
    stage: "second",
    intensity: ["serious"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "Bro...",
    message: "You lasted less than a YouTube Short. Lock back in.",
    mediaType: "text",
    tag: "youtube_short",
  },
  {
    id: "serious_second_2",
    stage: "second",
    intensity: ["serious"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "Is this your usual standard?",
    message: "You set a goal. Honor it.",
    mediaType: "text",
    tag: "accountability",
  },

  // ── SECOND QUIT: SAVAGE ────────────────────────────────────────
  {
    id: "savage_second_1",
    stage: "second",
    intensity: ["savage"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "YOU LASTED 2 MINUTES \ud83d\udc80",
    message: "Your attention span is on life support. Put your phone away and sit down.",
    mediaType: "text",
    tag: "cooked",
  },
  {
    id: "savage_second_2",
    stage: "second",
    intensity: ["savage"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "Quitting won\u2019t fix your results.",
    message: "The grind doesn\u2019t care about your mood. Get back to work.",
    mediaType: "text",
    tag: "harsh_truth",
  },

  // ── SECOND QUIT: BRAINROT ──────────────────────────────────────
  {
    id: "brainrot_second_1",
    stage: "second",
    intensity: ["brainrot"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "BRO IS COOKED \ud83d\udc80\ud83d\udc80\ud83d\udc80",
    message: "Bro got 0 rizz against a static countdown timer.",
    mediaType: "text",
    tag: "cooked_rizz",
  },

  // ── THIRD QUIT: ALL INTENSITIES ────────────────────────────────
  {
    id: "chill_third_1",
    stage: "third",
    intensity: ["chill"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "One last push.",
    message: "You\u2019ve come this far. Finishing this session will make your day.",
    mediaType: "text",
    tag: "gentle_push",
  },
  {
    id: "serious_third_1",
    stage: "third",
    intensity: ["serious"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "Third time trying to escape.",
    message: "You\u2019re negotiating with yourself. Don\u2019t let the distraction win.",
    mediaType: "text",
    tag: "negotiation",
  },
  {
    id: "savage_third_1",
    stage: "third",
    intensity: ["savage"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "WHAT ARE YOU DOING? \ud83d\udc80",
    message: "The timer is literally winning. How are you losing to numbers counting down?",
    mediaType: "text",
    tag: "losing_to_clock",
  },
  {
    id: "brainrot_third_1",
    stage: "third",
    intensity: ["brainrot"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "THE TIMER HAS ENTERED BOSS FIGHT MODE \ud83d\udc7e",
    message: "EMERGENCY: Rizz levels critically low. Skill issue detected.",
    mediaType: "text",
    tag: "boss_fight",
  },

  // ── RAPID QUITS (Spamming Quit) ────────────────────────────────
  {
    id: "rapid_chill_1",
    stage: "rapid",
    intensity: ["chill"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "Pacing yourself?",
    message: "Take a breath. No need to rush into leaving.",
    mediaType: "text",
    tag: "calm_down",
  },
  {
    id: "rapid_serious_1",
    stage: "rapid",
    intensity: ["serious", "savage"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "YOU\u2019RE FIGHTING THE TIMER NOW.",
    message: "Spamming the quit button won\u2019t make the work disappear.",
    mediaType: "text",
    tag: "button_masher",
  },
  {
    id: "rapid_savage_1",
    stage: "rapid",
    intensity: ["savage"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "SPEEDRUNNING FAILURE? \ud83d\udc80",
    message: "Bro is pressing buttons like he\u2019s in an arcade fighter. Lock in or accept defeat.",
    mediaType: "text",
    tag: "arcade_masher",
  },
  {
    id: "rapid_brainrot_1",
    stage: "rapid",
    intensity: ["brainrot"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "UNHINGED BUTTON MASHING DETECTED \ud83d\udea8",
    message: "Bro thinks rapid clicking will bypass the matrix. You are currently trapped in the focus realm.",
    mediaType: "text",
    tag: "matrix_glitch",
  },

  // ── FINAL QUIT (Stage 4+) ──────────────────────────────────────
  {
    id: "final_serious_1",
    stage: "final",
    intensity: ["serious", "chill"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "Final warning.",
    message: "If you walk away now, this session will count as abandoned.",
    mediaType: "text",
    tag: "final_warning",
  },
  {
    id: "final_savage_1",
    stage: "final",
    intensity: ["savage", "brainrot"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "LAST CHANCE TO SAVE YOUR DIGNITY. \ud83d\udc80",
    message: "Exit Challenge awaits on the other side. Sure you want to take that walk of shame?",
    mediaType: "text",
    tag: "walk_of_shame",
  },

  // ── TASK-SPECIFIC ROASTS: JEE ──────────────────────────────────
  {
    id: "jee_savage_1",
    stage: "second",
    intensity: ["serious", "savage", "brainrot"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "JEE RANK CRUMBLING IN REAL TIME \ud83d\udc80",
    message: "While you\u2019re clicking quit, 20,000 aspirants just solved 3 Rotational Dynamics problems.",
    mediaType: "text",
    tag: "jee_grind",
  },

  // ── TASK-SPECIFIC ROASTS: CODING ───────────────────────────────
  {
    id: "coding_savage_1",
    stage: "second",
    intensity: ["serious", "savage", "brainrot"],
    eventTypes: ["quit_attempt", "escape_key"],
    title: "Uncommitted changes, uncommitted dev.",
    message: "Can\u2019t even debug a 25-minute focus session without rage quitting.",
    mediaType: "text",
    tag: "git_blame",
  },

  // ── ESCAPE KEY SPECIALS ────────────────────────────────────────
  {
    id: "escape_key_1",
    stage: "first",
    intensity: ["serious", "savage", "brainrot"],
    eventTypes: ["escape_key"],
    title: "Pressed Escape?",
    message: "There is no escape from your potential. Get back to work.",
    mediaType: "text",
    tag: "keyboard_warrior",
  },

  // ── WINDOW BLUR / VISIBILITY NUDGES ────────────────────────────
  {
    id: "distraction_blur_1",
    stage: "second",
    intensity: ["serious", "savage", "brainrot"],
    eventTypes: ["window_blur", "visibility_hidden"],
    title: "Tab switched caught in 4K \ud83d\udcf8",
    message: "We saw you check that tab. Close YouTube and come back.",
    mediaType: "text",
    tag: "tab_switcher",
  },
];
