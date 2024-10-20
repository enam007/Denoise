import React from "react";

interface ToggleSwitchProps {
  isToggled: boolean;
  onToggle: () => void;
  label?: string; // Optional label prop
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  isToggled,
  onToggle,
  label,
}) => {
  return (
    <div className="flex items-center justify-between p-1 m-1">
      {label && <span className="text-sm">{label}</span>}{" "}
      {/* Display label if provided */}
      <label className="relative inline-block w-10 h-5">
        <input
          type="checkbox"
          checked={isToggled}
          onChange={onToggle}
          className="opacity-0 w-0 h-0"
        />
        <span
          className={`absolute inset-0 rounded-full transition-colors duration-300 ${
            isToggled ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 transform ${
              isToggled ? "translate-x-5" : ""
            }`}
          />
        </span>
      </label>
    </div>
  );
};

export default ToggleSwitch;
