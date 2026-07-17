import React from "react";

interface ToggleProps {
  leftLabel: string;
  rightLabel: string;
  checked: boolean; // true = left, false = right
  onChange: (checked: boolean) => void;
  activeColorClass?: string; // e.g. bg-rose-600, bg-sky-600
  className?: string; // for custom widths or extra styling
  fontSizeClass?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  leftLabel,
  rightLabel,
  checked,
  onChange,
  activeColorClass = "bg-sky-600",
  className = "w-44",
  fontSizeClass = "text-xs",
}) => {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center bg-white border border-slate-200 rounded-full p-0.5 cursor-pointer select-none ${className}`}
    >
      {/* Sliding background pill */}
      <div
        className={`absolute top-0.5 bottom-0.5 left-0.5 rounded-full transition-all duration-200 ease-out ${activeColorClass}`}
        style={{
          width: "calc(50% - 2px)",
          transform: checked ? "translateX(0)" : "translateX(100%)",
        }}
      />
      
      {/* Left Option */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onChange(true);
        }}
        className={`flex-1 relative z-10 py-1 ${fontSizeClass} font-medium rounded-full text-center transition-colors duration-200 cursor-pointer ${
          checked ? "text-white" : "text-slate-600 hover:text-slate-800"
        }`}
      >
        {leftLabel}
      </button>

      {/* Right Option */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onChange(false);
        }}
        className={`flex-1 relative z-10 py-1 ${fontSizeClass} font-medium rounded-full text-center transition-colors duration-200 cursor-pointer ${
          !checked ? "text-white" : "text-slate-600 hover:text-slate-800"
        }`}
      >
        {rightLabel}
      </button>
    </div>
  );
};

export default Toggle;
