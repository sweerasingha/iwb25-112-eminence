import React from "react";

interface Option {
  name: string;
  value: string;
}
type ComboBoxProps = {
  name: string;
  label?: string;
  options: Option[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  className?: string;
};

export const ComboBox: React.FC<ComboBoxProps> = ({
  name,
  label,
  options,
  value,
  onChange,
  className,
  error,
}) => {
  return (
    <div className={className}>
      <label htmlFor={name} className="block font-semibold mb-1">
        {label && label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.name}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
