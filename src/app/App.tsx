import React, { useEffect, useState } from "react";
import { initDatabase } from "@/database/db";
import { WaterReminderCard, WaterReminderOverlay } from "@/features/waterReminder";
import { Monitor, Database, CheckCircle2, ShieldCheck, Droplets, Sparkles } from "lucide-react";

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [isOverlayMode, setIsOverlayMode] = useState(false);

  useEffect(() => {
    // Check if running in dedicated transparent desktop overlay mode
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "overlay") {
      setIsOverlayMode(true);
      document.documentElement.style.backgroundColor = "transparent";
      document.body.style.backgroundColor = "transparent";
      document.documentElement.classList.remove("bg-[#08080a]");
      document.body.classList.remove("bg-[#08080a]");
    }

    // Initialize local SQLite database
    initDatabase()
      .then(() => setDbReady(true))
      .catch((err) => console.error("Database initialization notice:", err));
  }, []);

  if (isOverlayMode) {
    return (
      <div className="w-screen h-screen bg-transparent select-none overflow-hidden relative pointer-events-none">
        <WaterReminderOverlay isDesktopOverlayWindow={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#08080a] text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 select-none relative overflow-x-hidden">
      {/* Dynamic Background subtle ambient lighting */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/25 via-[#08080a] to-[#08080a] pointer-events-none" />
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main App Container */}
      <main className="relative z-10 flex flex-col items-center max-w-lg w-full my-auto py-6">
        {/* Core Water Reminder Dashboard Card */}
        <WaterReminderCard />

        {/* System Architecture Metadata Footer */}
        <footer className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap mt-6 text-[11px] font-mono text-zinc-500/90">
          <span className="flex items-center gap-1.5 text-cyan-400/90 font-medium">
            <Droplets className="w-3.5 h-3.5" />
            LOCKIN Engine
          </span>
          <span className="text-zinc-700">•</span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <Monitor className="w-3.5 h-3.5 text-cyan-500/70" />
            Active
          </span>
          <span className="text-zinc-700">•</span>
          <span className="flex items-center gap-1.5 text-emerald-400/90">
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <CheckCircle2 className="w-3 h-3" />
            {dbReady ? "SQLite Ready" : "SQLite Local"}
          </span>
          <span className="text-zinc-700">•</span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
            100% Offline
          </span>
        </footer>
      </main>

      {/* Local Preview Overlay for in-dashboard testing */}
      <WaterReminderOverlay />
    </div>
  );
}

