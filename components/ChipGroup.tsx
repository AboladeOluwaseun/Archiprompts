'use client';

import { useState } from 'react';
import { ChipOption } from '@/lib/types';

interface ChipGroupProps {
  options: ChipOption[];
  selected: string | string[];
  onToggle: (value: string) => void;
  multi?: boolean;
}

export default function ChipGroup({ options, selected, onToggle, multi }: ChipGroupProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const isActive = (value: string) =>
    multi ? (selected as string[]).includes(value) : selected === value;

  const handleCustomSubmit = () => {
    const trimmed = customValue.trim();
    if (!trimmed) return;
    onToggle(trimmed);
    setCustomValue('');
    setShowCustom(false);
  };

  return (
    <div className="chips">
      {options.map((o) => (
        <div
          key={o.value}
          className={`chip${isActive(o.value) ? ' active' : ''}`}
          onClick={() => onToggle(o.value)}
        >
          {o.label}
        </div>
      ))}

      {showCustom ? (
        <div className="chip-custom-input">
          <input
            type="text"
            placeholder="Type your own…"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCustomSubmit(); }}
            autoFocus
          />
          <button type="button" className="chip-add-btn" onClick={handleCustomSubmit}>
            ✓
          </button>
          <button type="button" className="chip-cancel-btn" onClick={() => { setShowCustom(false); setCustomValue(''); }}>
            ✕
          </button>
        </div>
      ) : (
        <div
          className="chip chip-other"
          onClick={() => setShowCustom(true)}
        >
          + Other
        </div>
      )}
    </div>
  );
}
