
import React from 'react';

interface TextAreaFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  placeholder?: string;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({ label, name, value, onChange, rows = 4, placeholder }) => {
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="mb-2 font-semibold text-slate-600">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-y"
      />
    </div>
  );
};

export default TextAreaField;
