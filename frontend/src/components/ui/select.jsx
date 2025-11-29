import React, { useState, useRef, useEffect } from "react";

// Wrapper Select
export const Select = ({ value, onValueChange, children }) => {
  return (
    <div className="relative w-full">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { value, onValueChange })
      )}
    </div>
  );
};

// Value Display Component
export const SelectValue = ({ placeholder, value }) => {
  return (
    <span className="text-white">
      {value ? value : <span className="text-gray-400">{placeholder}</span>}
    </span>
  );
};

// Trigger Button
export const SelectTrigger = ({
  value,
  onValueChange,
  children,
  className = "",
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-slate-900 border border-yellow-600 text-white px-4 py-2 rounded-lg flex justify-between items-center"
      >
        {children}
        <span className="text-yellow-400">▼</span>
      </button>

      {open && (
        <div className="absolute w-full bg-slate-900 border border-slate-700 rounded-lg mt-2 z-50 shadow-xl max-h-60 overflow-y-auto">
          {React.Children.map(children, (child) =>
            child.type?.displayName === "SelectContent"
              ? React.cloneElement(child, {
                  onSelect: (val) => {
                    onValueChange(val);
                    setOpen(false);
                  },
                })
              : null
          )}
        </div>
      )}
    </div>
  );
};

// Dropdown Container
export const SelectContent = ({ children, onSelect }) => {
  return <div className="py-1">{React.Children.map(children, (child) =>
    React.cloneElement(child, { onSelect })
  )}</div>;
};
SelectContent.displayName = "SelectContent";

// Dropdown Item
export const SelectItem = ({ children, value, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(value)}
      className="px-4 py-2 cursor-pointer hover:bg-slate-800 text-white"
    >
      {children}
    </div>
  );
};
SelectItem.displayName = "SelectItem";
