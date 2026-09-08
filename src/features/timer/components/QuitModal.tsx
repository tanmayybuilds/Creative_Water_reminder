"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ShieldAlert } from "lucide-react";

interface QuitModalProps {
  isOpen: boolean;
  onKeepGoing: () => void;
  quitCount: number;
}

export const QuitModal: React.FC<QuitModalProps> = ({
  isOpen,
  onKeepGoing,
  quitCount,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onKeepGoing}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative z-10 w-full max-w-sm rounded-2xl bg-zinc-950 border border-zinc-800 p-6 text-center shadow-2xl flex flex-col items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quit-modal-title"
          >
            <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-800/40 flex items-center justify-center mb-4 text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3
              id="quit-modal-title"
              className="text-lg font-bold text-white mb-2"
            >
              Quit intervention coming soon.
            </h3>

            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Commitment Mode is active. You can quit, but should you? The meme intervention engine will be unlocked in Step 4.
            </p>

            {quitCount > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 mb-6">
                <AlertCircle className="w-3 h-3 text-yellow-500" />
                <span>{quitCount} quit attempt{quitCount > 1 ? "s" : ""} recorded</span>
              </div>
            )}

            <button
              onClick={onKeepGoing}
              autoFocus
              className="w-full py-3.5 px-6 rounded-xl bg-white text-black font-bold text-sm tracking-wider uppercase hover:bg-zinc-200 transition-all duration-200 shadow-lg shadow-white/5 active:scale-[0.98] cursor-pointer"
            >
              KEEP GOING
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
