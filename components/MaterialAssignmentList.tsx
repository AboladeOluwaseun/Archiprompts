"use client";

import { useState } from "react";
import { MaterialAssignment, SelectOption } from "@/lib/types";

const OTHER_VALUE = "__other__";

interface RowFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  ariaLabel: string;
  placeholder: string;
}

function RowField({ value, onChange, options, ariaLabel, placeholder }: RowFieldProps) {
  const matchesOption = options.some((o) => o.value === value);
  const [showCustom, setShowCustom] = useState(!matchesOption && value !== "");
  const [customInput, setCustomInput] = useState(matchesOption ? "" : value);

  if (showCustom) {
    return (
      <div className="custom-input-row">
        <input
          type="text"
          value={customInput}
          placeholder={placeholder}
          onChange={(e) => {
            setCustomInput(e.target.value);
            onChange(e.target.value);
          }}
          aria-label={ariaLabel}
          autoFocus
        />
        <button
          type="button"
          className="custom-back-btn"
          onClick={() => {
            setShowCustom(false);
            setCustomInput("");
            onChange(options[0]?.value ?? "");
          }}
          title="Back to list"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => {
        if (e.target.value === OTHER_VALUE) {
          setShowCustom(true);
          setCustomInput("");
          onChange("");
          return;
        }
        onChange(e.target.value);
      }}
      aria-label={ariaLabel}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
      <option value={OTHER_VALUE}>Other…</option>
    </select>
  );
}

interface MaterialAssignmentListProps {
  assignments: MaterialAssignment[];
  onChange: (next: MaterialAssignment[]) => void;
  zoneOptions: SelectOption[];
  materialOptions: SelectOption[];
  addLabel?: string;
}

export default function MaterialAssignmentList({
  assignments,
  onChange,
  zoneOptions,
  materialOptions,
  addLabel = "+ Add Material Zone",
}: MaterialAssignmentListProps) {
  const [expanded, setExpanded] = useState(false);

  const updateRow = (index: number, patch: Partial<MaterialAssignment>) => {
    onChange(
      assignments.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  };

  const removeRow = (index: number) => {
    onChange(assignments.filter((_, i) => i !== index));
  };

  const addRow = () => {
    const usedZones = new Set(assignments.map((a) => a.zone));
    const nextZone =
      zoneOptions.find((z) => !usedZones.has(z.value))?.value ??
      zoneOptions[0]?.value ??
      "";
    onChange([
      ...assignments,
      { zone: nextZone, material: materialOptions[0]?.value ?? "" },
    ]);
  };

  const materialLabel = (value: string) =>
    materialOptions.find((o) => o.value === value)?.label ?? value;

  if (!expanded) {
    const summary =
      assignments.length === 0
        ? "No materials assigned"
        : assignments.map((a) => materialLabel(a.material)).join(" + ");

    return (
      <div className="material-summary">
        <span className="material-summary-text">
          {summary}
          <span className="material-summary-count">
            {" — "}
            {assignments.length} zone{assignments.length === 1 ? "" : "s"}
          </span>
        </span>
        <button
          type="button"
          className="material-customize-btn"
          onClick={() => setExpanded(true)}
        >
          Customize
        </button>
      </div>
    );
  }

  return (
    <div className="material-assignment-list">
      {assignments.map((row, index) => (
        <div className="material-row" key={index}>
          <RowField
            key={`zone-${index}`}
            value={row.zone}
            onChange={(v) => updateRow(index, { zone: v })}
            options={zoneOptions}
            ariaLabel="Zone"
            placeholder="Type a custom zone…"
          />
          <RowField
            key={`material-${index}`}
            value={row.material}
            onChange={(v) => updateRow(index, { material: v })}
            options={materialOptions}
            ariaLabel="Material"
            placeholder="Type a custom material…"
          />
          <button
            type="button"
            className="material-row-remove"
            onClick={() => removeRow(index)}
            disabled={assignments.length <= 1}
            title={
              assignments.length <= 1
                ? "At least one material is required"
                : "Remove this zone"
            }
          >
            ×
          </button>
        </div>
      ))}

      <div className="material-assignment-actions">
        <button type="button" className="material-add-btn" onClick={addRow}>
          {addLabel}
        </button>
        <button
          type="button"
          className="material-collapse-btn"
          onClick={() => setExpanded(false)}
        >
          Done
        </button>
      </div>
    </div>
  );
}
