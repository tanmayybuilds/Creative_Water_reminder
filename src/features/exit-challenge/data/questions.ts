import type { ExitQuestion } from "@/types";

export const EXIT_QUESTIONS: ExitQuestion[] = [
  {
    id: "q_crore_prize",
    question: "You suddenly receive ₹1 crore in your bank account right now. What\u2019s your first move?",
    options: [
      { id: "a", label: "Buy a luxury car and disappear.", reaction: "Speeding away from all responsibilities. Classic." },
      { id: "b", label: "Invest it all in index funds and SIPs.", reaction: "Financially responsible. Very suspicious." },
      { id: "c", label: "Travel the world and never check email.", reaction: "Living the dream while your unread emails pile up." },
      { id: "d", label: "Pretend nothing happened and take a nap.", reaction: "Peak composure. Respect the tranquility." },
    ],
  },
  {
    id: "q_money_vs_followers",
    question: "Would you rather have ₹10 crore or 10 million loyal social media followers?",
    options: [
      { id: "a", label: "₹10 crore in cash, no questions asked.", reaction: "Direct and practical. The bag was secured." },
      { id: "b", label: "10 million followers to monetize forever.", reaction: "Playing the long influencer game. Respect the hustle." },
      { id: "c", label: "Neither, I just want 8 hours of uninterrupted sleep.", reaction: "The true millennial/Gen Z currency: uninterrupted sleep." },
      { id: "d", label: "Whatever gets me out of this study session faster.", reaction: "At least you are consistently honest with yourself." },
    ],
  },
  {
    id: "q_friend_famous",
    question: "Your closest friend becomes a viral internet celebrity overnight. Your genuine reaction?",
    options: [
      { id: "a", label: "Become their full-time manager on a 20% cut.", reaction: "Business mindset activated instantly." },
      { id: "b", label: "Comment 'I knew them when they had 12 followers' on every post.", reaction: "Gatekeeping the original fan card. A true friend." },
      { id: "c", label: "Leak their embarrassing 7th-grade photos.", reaction: "Villain arc unlocked. Brutal." },
      { id: "d", label: "Mute their stories and question your life choices.", reaction: "The quiet comparison spiral. We\u2019ve all been there." },
    ],
  },
  {
    id: "q_monday_superpower",
    question: "You are granted one superpower, but it only works on Mondays. What do you choose?",
    options: [
      { id: "a", label: "Instant Teleportation.", reaction: "Skipping Monday morning traffic is top tier." },
      { id: "b", label: "Infinite Energy & Focus.", reaction: "If only you had that power right now instead of quitting." },
      { id: "c", label: "Time Travel to fast-forward straight to Friday.", reaction: "Erasing the entire work week. Bold strategy." },
      { id: "d", label: "Mind Reading to see who actually wants to be awake.", reaction: "Spoiler: nobody wants to be awake." },
    ],
  },
  {
    id: "q_delete_subject",
    question: "You can permanently delete one school subject from the universe. Which one goes?",
    options: [
      { id: "a", label: "Rotational Dynamics & Physics Mechanics.", reaction: "JEE aspirants worldwide are celebrating." },
      { id: "b", label: "Organic Chemistry mechanisms.", reaction: "Say goodbye to benzene rings and reaction pathways." },
      { id: "c", label: "Calculus & Integration.", reaction: "Integration was never finding the area under the curve anyway." },
      { id: "d", label: "History dates and treaty memorization.", reaction: "Those 18th-century treaties can no longer hurt you." },
    ],
  },
  {
    id: "q_unlimited_dish",
    question: "You get unlimited free food forever, but you can only eat ONE dish. What are you picking?",
    options: [
      { id: "a", label: "Hyderabadi Chicken Biryani.", reaction: "A royal choice. Can never go wrong with Biryani." },
      { id: "b", label: "Paneer Butter Masala with Garlic Naan.", reaction: "North Indian comfort food supremacy." },
      { id: "c", label: "Woodfired Pizza with extra cheese.", reaction: "Carb loading for eternity. Solid pick." },
      { id: "d", label: "Maggi with extra masala at 2 AM.", reaction: "College hostel survivalist detected." },
    ],
  },
  {
    id: "q_rich_vs_famous",
    question: "Would you rather be extraordinarily rich but completely unknown, or world-famous but completely broke?",
    options: [
      { id: "a", label: "Rich & Unknown: Stealth wealth all day.", reaction: "Silent billionaire vibes. The cleanest lifestyle." },
      { id: "b", label: "Famous & Broke: Give me the clout and VIP tables.", reaction: "Living purely for the paparazzi. Fascinating choice." },
      { id: "c", label: "Average wealth, average fame, zero stress.", reaction: "The peaceful path of minimal resistance." },
      { id: "d", label: "Whatever gives me the discipline to finish my timer.", reaction: "Self-awareness is the first step to greatness." },
    ],
  },
  {
    id: "q_battery_emergency",
    question: "Your phone is at 1% battery and you have 5 seconds to send one text. Who gets it?",
    options: [
      { id: "a", label: "Mom: 'Battery dying, I\u2019m fine!'", reaction: "Avoiding a frantic 15-call welfare check. Smart." },
      { id: "b", label: "Best friend: An unhinged meme with no context.", reaction: "Priorities sorted. The meme grind never stops." },
      { id: "c", label: "Group chat: 'I have shocking news...' then turn off phone.", reaction: "Maximum psychological chaos. Devilish." },
      { id: "d", label: "Nobody, let the phone die in peace.", reaction: "Going completely off the grid. Serene." },
    ],
  },
  {
    id: "q_elevator_stuck",
    question: "You are stuck in an elevator for 4 hours with one fictional character. Who are you choosing?",
    options: [
      { id: "a", label: "Tony Stark (he\u2019ll hack the elevator in 30 seconds).", reaction: "Practical thinking. Engineer your way out." },
      { id: "b", label: "Sherlock Holmes (to deduce everyone\u2019s life story).", reaction: "Prepare to be thoroughly psychoanalyzed for 4 hours." },
      { id: "c", label: "Deadpool (endless comedy and fourth-wall breaks).", reaction: "You will either laugh until you cry or lose your sanity." },
      { id: "d", label: "Goku (he\u2019ll just instant-transmission you out).", reaction: "Direct teleportation escape route. Flawless logic." },
    ],
  },
  {
    id: "q_time_machine",
    question: "A time machine appears in front of you. Where are you heading first?",
    options: [
      { id: "a", label: "2010 to buy 1,000 Bitcoins for ₹5,000.", reaction: "Hindsight financial genius. We all wish." },
      { id: "b", label: "Year 3000 to see flying cars and cyberpunk cities.", reaction: "Exploring the sci-fi future. Hope Earth is still here." },
      { id: "c", label: "Ancient Egypt to see how the pyramids were actually built.", reaction: "Solving mankind\u2019s greatest architectural mystery." },
      { id: "d", label: "25 minutes ago so I didn\u2019t press the Quit button.", reaction: "Regret is setting in already! Lock back in!" },
    ],
  },
  {
    id: "q_ted_talk",
    question: "You must give a 30-minute TED Talk right now with zero preparation. What is your topic?",
    options: [
      { id: "a", label: "The Art of Professional Procrastination.", reaction: "You could write a PhD thesis on that right now." },
      { id: "b", label: "Deep analysis of Marvel Cinematic Universe plot holes.", reaction: "A 30-minute rant backed by passionate Reddit research." },
      { id: "c", label: "Why 8 hours of sleep is a myth created by mattress companies.", reaction: "Conspiracy theory TED Talk. The audience is hooked." },
      { id: "d", label: "How to survive an intense LOCKIN session without quitting.", reaction: "Ironic considering you are currently on the exit screen." },
    ],
  },
  {
    id: "q_study_snack",
    question: "What is the undisputed champion of late-night study snacks?",
    options: [
      { id: "a", label: "Chai and Parle-G biscuits.", reaction: "The timeless Indian study fuel of champions." },
      { id: "b", label: "Black Coffee brewed like jet fuel.", reaction: "Heart rate: 180 BPM. Focus: questionable." },
      { id: "c", label: "Chips, kurkure, and junk food.", reaction: "Greasy fingers and crunchy distractions." },
      { id: "d", label: "Pure water and sheer unyielding willpower.", reaction: "Monk mode activated. Ascended discipline." },
    ],
  },
  {
    id: "q_fluent_language",
    question: "You can instantly speak one language fluently with zero effort. Which one?",
    options: [
      { id: "a", label: "Japanese (to watch anime with no subtitles).", reaction: "The ultimate otaku dream achieved." },
      { id: "b", label: "Spanish (sounds romantic and globally useful).", reaction: "Hola amigo! Ready to conquer the Spanish-speaking world." },
      { id: "c", label: "Python & C++ (as spoken languages).", reaction: "Talking directly to the compiler. Ultra nerd tier." },
      { id: "d", label: "The language of animals so dogs can tell me their thoughts.", reaction: "Finally discovering why dogs bark at empty walls." },
    ],
  },
  {
    id: "q_wifi_down",
    question: "Your home Wi-Fi and mobile data go down for an entire weekend. How do you survive?",
    options: [
      { id: "a", label: "Discover what offline video games are again.", reaction: "Dusting off the offline single-player games." },
      { id: "b", label: "Actually read a physical book from start to finish.", reaction: "Ancient scholar mode re-engaged." },
      { id: "c", label: "Stare at the ceiling and contemplate the universe.", reaction: "Philosophy born from bandwidth deprivation." },
      { id: "d", label: "Go outside and touch real grass.", reaction: "Touching grass: the ultimate modern adventure." },
    ],
  },
  {
    id: "q_skip_time",
    question: "You get the power to skip any 30 minutes of your day automatically. Where do you use it?",
    options: [
      { id: "a", label: "Daily commute in heavy traffic.", reaction: "Skipping bumper-to-bumper honking. Absolute bliss." },
      { id: "b", label: "The first 30 minutes after waking up when everything hurts.", reaction: "Fast-forwarding directly to functional alertness." },
      { id: "c", label: "Boring Zoom meetings that could have been an email.", reaction: "Corporate survival skill +100." },
      { id: "d", label: "The final 30 minutes of a grueling workout.", reaction: "Getting the gains without the suffering. Smart." },
    ],
  },
  {
    id: "q_theme_song",
    question: "If your focus session had a soundtrack right now, what genre would it be?",
    options: [
      { id: "a", label: "Lofi hip hop chill study beats to relax to.", reaction: "Classic cozy study aesthetic." },
      { id: "b", label: "Aggressive phonk / gym bass boost.", reaction: "150 BPM adrenaline rush to solve arithmetic." },
      { id: "c", label: "Dark academia classical symphony.", reaction: "Writing notes like a 19th-century philosopher." },
      { id: "d", label: "The circus theme music.", reaction: "Self-deprecating humor at its finest." },
    ],
  },
  {
    id: "q_magic_lamp",
    question: "You find an ancient magical lamp with a genie. What is your first wish?",
    options: [
      { id: "a", label: "Infinite wealth and financial freedom.", reaction: "Securing generational prosperity on wish #1." },
      { id: "b", label: "Photographic memory for everything I read.", reaction: "Top 1 rank in every exam instantly guaranteed." },
      { id: "c", label: "Never feeling tired or sleepy during the day.", reaction: "Infinite productivity glitch unlocked." },
      { id: "d", label: "Three more wishes, obviously.", reaction: "Attempting to outsmart the genie. Classic rule-breaker." },
    ],
  },
  {
    id: "q_procrastination_excuse",
    question: "Which procrastination excuse have you used the most in your life?",
    options: [
      { id: "a", label: "'I\u2019ll start exactly at 5:00 PM (it is currently 5:02 PM).'", reaction: "The clock interval trap! Must wait for 6:00 PM now." },
      { id: "b", label: "'Let me clean my entire room first to create a study vibe.'", reaction: "Productive procrastination: scrubbing baseboards instead of studying." },
      { id: "c", label: "'I work much better under intense last-minute pressure.'", reaction: "Adrenaline-fueled panic disguised as strategy." },
      { id: "d", label: "'Just one 5-minute reel...' (3 hours pass).", reaction: "The infinite algorithmic scroll got you." },
    ],
  },
  {
    id: "q_alien_leader",
    question: "Aliens land on Earth and demand to speak to our supreme leader. Who are you sending?",
    options: [
      { id: "a", label: "Shah Rukh Khan to charm the alien civilization.", reaction: "Diplomatic charisma: maximum. Aliens will become fans." },
      { id: "b", label: "Elon Musk so they take him back to Mars with them.", reaction: "Direct one-way interplanetary transfer arranged." },
      { id: "c", label: "Gordon Ramsay to critique their alien food.", reaction: "They will be called an 'idiot sandwich' across galaxies." },
      { id: "d", label: "Myself, maybe they have better study timers on their planet.", reaction: "Interstellar escape attempt. Creative." },
    ],
  },
  {
    id: "q_real_reason",
    question: "What is the genuine, unfiltered reason you are clicking Quit right now?",
    options: [
      { id: "a", label: "A notification buzzed and curiosity defeated my soul.", reaction: "The ping of doom. Put your phone on DND next time!" },
      { id: "b", label: "My brain felt tired for 2 seconds so I gave up.", reaction: "The micro-fatigue surrender. Honor your commitment!" },
      { id: "c", label: "I genuinely need food / water / bathroom break.", reaction: "Physical biology accepted. Valid excuse." },
      { id: "d", label: "Just testing if this exit challenge mini-game actually works.", reaction: "The developer / QA tester excuse. Nice try!" },
    ],
  },
];
