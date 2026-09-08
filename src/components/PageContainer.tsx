import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  centered?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = "",
  centered = false,
}) => {
  return (
    <div
      className={`min-h-screen w-full bg-[#08080a] text-zinc-100 flex flex-col items-center relative overflow-x-hidden px-4 py-8 antialiased ${
        centered ? "justify-center" : "justify-start"
      } ${className}`}
    >
      {/* Background ambient radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-[#08080a] to-[#08080a] pointer-events-none" />
      <div
        className={`relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center ${
          centered ? "justify-center flex-1" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
};
