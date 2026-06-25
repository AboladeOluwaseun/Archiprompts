"use client";

import { useState, useEffect, useRef } from "react";
import { SelectOption } from "@/lib/types";

const OTHER_VALUE = "__other__";

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}

export default function SelectField({
  label,
  value,
  onChange,
  options,
}: SelectFieldProps) {
  const [localOptions, setLocalOptions] = useState<SelectOption[]>(options);
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  const handleSelect = (v: string) => {
    setOpen(false);

    if (v === OTHER_VALUE) {
      setShowCustom(true);
      setCustomInput("");
      onChange("");
      return;
    }

    setShowCustom(false);
    onChange(v);
  };

  useEffect(() => {
    const selected = localOptions.find((option) => option.value === value);
    if (selected) {
      setShowCustom(false);
      setCustomInput("");
    } else if (value) {
      setShowCustom(true);
      setCustomInput(value);
    }

    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selectedOption = localOptions.find((option) => option.value === value);
  const selectedLabel =
    selectedOption?.label ||
    (showCustom && customInput
      ? customInput
      : `Choose ${label.toLowerCase()}…`);

  return (
    <div className="fg">
      <label>{label}</label>
      <div ref={rootRef} className="typeahead-root">
        {showCustom ? (
          <div className="custom-input-row">
            <input
              type="text"
              placeholder={`Type your ${label.toLowerCase()}…`}
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value);
                onChange(e.target.value);
              }}
              autoFocus
            />
            <button
              type="button"
              className="custom-back-btn"
              onClick={() => {
                setShowCustom(false);
                setCustomInput("");
                onChange("");
              }}
              title="Back to list"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="typeahead-toggle"
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-controls={`typeahead-${label.replace(/\s+/g, "-").toLowerCase()}`}
              onClick={() => setOpen((prev) => !prev)}
            >
              <span
                className={
                  selectedOption ? "typeahead-value" : "typeahead-placeholder"
                }
              >
                {selectedLabel}
              </span>
            </button>

            {open && (
              <ul
                className="typeahead-list"
                id={`typeahead-${label.replace(/\s+/g, "-").toLowerCase()}`}
                role="listbox"
              >
                {localOptions.map((option) => (
                  <li
                    key={option.value}
                    role="option"
                    className={option.value === value ? "hl" : undefined}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(option.value);
                    }}
                  >
                    {option.label}
                  </li>
                ))}
                <li
                  className="other"
                  role="option"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(OTHER_VALUE);
                  }}
                >
                  Other…
                </li>
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
