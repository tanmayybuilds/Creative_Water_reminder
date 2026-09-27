import React from "react";

interface LogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showBadge?: boolean;
  badgeText?: string;
  showSubtitle?: boolean;
  subtitleText?: string;
  iconOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  size = "md",
  showBadge = false,
  badgeText = "DESKTOP",
  showSubtitle = false,
  subtitleText = "The Focus & Hydration Sentinel",
  iconOnly = false,
}) => {
  const sizeMap = {
    xs: {
      icon: "w-5 h-5",
      text: "text-lg",
      badge: "text-[9px] px-1.5 py-0.5",
      sub: "text-[10px]",
    },
    sm: {
      icon: "w-7 h-7",
      text: "text-xl",
      badge: "text-[10px] px-2 py-0.5",
      sub: "text-[11px]",
    },
    md: {
      icon: "w-9 h-9",
      text: "text-2xl sm:text-3xl",
      badge: "text-[10px] px-2.5 py-0.5",
      sub: "text-xs",
    },
    lg: {
      icon: "w-12 h-12",
      text: "text-4xl sm:text-5xl",
      badge: "text-xs px-3 py-1",
      sub: "text-sm",
    },
    xl: {
      icon: "w-16 h-16",
      text: "text-6xl sm:text-7xl",
      badge: "text-xs px-3.5 py-1.5",
      sub: "text-base",
    },
  };

  const currentSize = sizeMap[size];

  const [imgFailed, setImgFailed] = React.useState(false);

  const Emblem = (
    <div className={`relative flex items-center justify-center ${currentSize.icon} shrink-0 group`}>
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/40 via-teal-400/20 to-blue-600/40 rounded-2xl blur-md group-hover:blur-lg transition-all duration-300 pointer-events-none" />

      {!imgFailed ? (
        <img
          src="/icon.png"
          alt="LOCKIN Logo"
          onError={() => setImgFailed(true)}
          className="relative w-full h-full object-contain rounded-xl drop-shadow-[0_2px_10px_rgba(6,182,212,0.4)]"
        />
      ) : (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full drop-shadow-[0_2px_10px_rgba(6,182,212,0.4)]"
        >
          <defs>
            <linearGradient id="lockin-grad-primary" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="lockin-grad-inner" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#67e8f9" />
            </linearGradient>
          </defs>

          {/* Outer Shield Hexagon/Rounded Pill */}
          <rect
            x="4"
            y="4"
            width="40"
            height="40"
            rx="12"
            fill="#0c121e"
            stroke="url(#lockin-grad-primary)"
            strokeWidth="2.5"
          />

          {/* Shackle */}
          <path
            d="M17 21V16C17 12.134 20.134 9 24 9C27.866 9 31 12.134 31 16V21"
            stroke="url(#lockin-grad-inner)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Water Droplet Lock Body */}
          <path
            d="M24 18C19 23.5 15 28 15 32.5C15 37.1944 19.0294 41 24 41C28.9706 41 33 37.1944 33 32.5C33 28 29 23.5 24 18Z"
            fill="url(#lockin-grad-primary)"
          />

          {/* Keyhole Spark in Center */}
          <circle cx="24" cy="31" r="2.2" fill="#ffffff" />
          <path d="M22.8 31.5L21.5 36.5H26.5L25.2 31.5H22.8Z" fill="#ffffff" />
        </svg>
      )}
    </div>
  );

  if (iconOnly) {
    return <div className={`inline-flex items-center ${className}`}>{Emblem}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {Emblem}

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`${currentSize.text} font-black tracking-tight text-white font-mono uppercase leading-none`}
            style={{
              textShadow: "0 0 30px rgba(6, 182, 212, 0.25)",
            }}
          >
            LOCK<span className="text-cyan-400">IN</span>
          </span>

          {showBadge && (
            <span
              className={`${currentSize.badge} font-mono font-bold uppercase rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 tracking-wider`}
            >
              {badgeText}
            </span>
          )}
        </div>

        {showSubtitle && (
          <span className={`${currentSize.sub} font-medium text-zinc-400 mt-1`}>
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );
};
