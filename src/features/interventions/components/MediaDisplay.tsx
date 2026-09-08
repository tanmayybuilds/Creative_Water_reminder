"use client";

import React, { useState } from "react";
import type { InterventionContent } from "@/types";
import { Flame, ShieldAlert, Sparkles, Skull } from "lucide-react";

interface MediaDisplayProps {
  content: InterventionContent;
  className?: string;
}

export const MediaDisplay: React.FC<MediaDisplayProps> = ({
  content,
  className = "",
}) => {
  const [hasMediaError, setHasMediaError] = useState(false);

  // If there is media and no error
  if (!hasMediaError && content.mediaPath) {
    if (content.mediaType === "video") {
      return (
        <div className={`relative w-full max-w-sm rounded-xl overflow-hidden bg-black/60 border border-white/10 ${className}`}>
          <video
            src={content.mediaPath}
            autoPlay
            muted
            loop
            playsInline
            onError={() => setHasMediaError(true)}
            className="w-full h-auto max-h-56 object-cover"
          />
        </div>
      );
    }

    if (content.mediaType === "image" || content.mediaType === "gif") {
      return (
        <div className={`relative w-full max-w-sm rounded-xl overflow-hidden bg-black/60 border border-white/10 ${className}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content.mediaPath}
            alt={content.title}
            onError={() => setHasMediaError(true)}
            className="w-full h-auto max-h-56 object-contain"
          />
        </div>
      );
    }
  }

  // Visual Text Meme Fallback Card
  const getStageIcon = () => {
    switch (content.stage) {
      case "first":
        return <Sparkles className="w-5 h-5 text-blue-400" />;
      case "second":
        return <Flame className="w-5 h-5 text-orange-400" />;
      case "third":
        return <Skull className="w-5 h-5 text-red-400" />;
      case "rapid":
        return <ShieldAlert className="w-5 h-5 text-yellow-400 animate-pulse" />;
      case "final":
        return <Skull className="w-5 h-5 text-red-500" />;
      default:
        return <ShieldAlert className="w-5 h-5 text-zinc-400" />;
    }
  };

  return (
    <div
      className={`relative w-full max-w-md rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 sm:p-6 text-center select-none shadow-2xl overflow-hidden ${className}`}
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

      {/* Stage Badge & Icon */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
          {getStageIcon()}
        </div>
      </div>

      {/* Tag / Category */}
      {content.tag && (
        <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-zinc-500 mb-1 block">
          {content.tag.replace(/_/g, " ")}
        </span>
      )}

      {/* Title */}
      <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2 leading-tight">
        {content.title}
      </h3>

      {/* Message */}
      <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed max-w-xs mx-auto">
        &ldquo;{content.message}&rdquo;
      </p>
    </div>
  );
};
