type TextAreaFieldProps = {
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  rows?: number;
};

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  name,
  label,
  value,
  onChange,
  error,
  rows = 4,
}) => (
  <div className="mb-4">
    <label htmlFor={name} className="block  font-semibold mb-1">
      {label}
    </label>
    <textarea
      id={name}
      name={name}
      rows={rows}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border ${
        error ? "border-red-500" : "border-gray-300"
      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);
