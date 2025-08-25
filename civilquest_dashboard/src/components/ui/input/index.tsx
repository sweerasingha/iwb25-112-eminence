import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type InputFieldProps = {
  name: string;
  label: string;
  type?: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  showToggle?: boolean;
  autoComplete?: string;
};

export const InputField: React.FC<InputFieldProps> = ({
  name,
  label,
  type = "text",
  value,
  onChange,
  error,
  showToggle,
  autoComplete,
}) => {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const effectiveType = isPassword && showToggle ? (visible ? "text" : "password") : type;

  return (
    <div className={`mb ${isPassword && showToggle ? "password-toggle-wrapper" : ""}`}>
      <label htmlFor={name} className="block font-semibold mb-1">
        {label ?? label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={effectiveType}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete ?? (isPassword ? "new-password" : undefined)}
          className={`w-full ${isPassword && showToggle ? "pr-10" : ""} px-3 py-2 border ${
            error ? "border-red-500" : "border-gray-300"
          } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {isPassword && showToggle && (
          <button
            type="button"
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setVisible((v) => !v)}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
