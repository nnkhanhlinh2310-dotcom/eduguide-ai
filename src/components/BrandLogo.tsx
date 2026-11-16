import React from "react";

interface BrandLogoProps {
  compact?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ compact = false }) => {
  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none">
      <svg
        width={compact ? 28 : 34}
        height={compact ? 28 : 34}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="36" height="36" rx="8" fill="#1D4ED8" />
        <path
          d="M18 7.5L28 13L18 18.5L8 13L18 7.5Z"
          fill="#FFFFFF"
        />
        <path
          d="M11.5 16.2V22.4C11.5 24.4 14.4 26.5 18 26.5C21.6 26.5 24.5 24.4 24.5 22.4V16.2L18 19.8L11.5 16.2Z"
          fill="#BFDBFE"
        />
        <path
          d="M27.5 14.5V22.5"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span
        className={`font-display font-bold tracking-tight text-[#0F172A] ${
          compact ? "text-base" : "text-lg"
        }`}
      >
        EduGuide <span className="text-[#1D4ED8]">AI</span>
      </span>
    </span>
  );
};
