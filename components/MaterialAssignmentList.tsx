"use client";

import { MaterialAssignment, SelectOption } from "@/lib/types";

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

  return (
    <div className="material-assignment-list">
      {assignments.map((row, index) => (
        <div className="material-row" key={index}>
          <select
            value={row.zone}
            onChange={(e) => updateRow(index, { zone: e.target.value })}
            aria-label="Zone"
          >
            {zoneOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={row.material}
            onChange={(e) => updateRow(index, { material: e.target.value })}
            aria-label="Material"
          >
            {materialOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
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

      <button type="button" className="material-add-btn" onClick={addRow}>
        {addLabel}
      </button>
    </div>
  );
}
