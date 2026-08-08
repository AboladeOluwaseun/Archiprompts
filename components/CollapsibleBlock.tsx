"use client";

import { useState, useEffect, ReactNode } from "react";

interface CollapsibleBlockProps {
  index: string;
  title: string;
  summary: string;
  defaultOpen?: boolean;
  /** Incrementing token — bump to force this block open (e.g. from an "Expand all" button). */
  expandSignal?: number;
  /** Incrementing token — bump to force this block closed (e.g. from a "Collapse all" button). */
  collapseSignal?: number;
  children: ReactNode;
}

export default function CollapsibleBlock({
  index,
  title,
  summary,
  defaultOpen = false,
  expandSignal,
  collapseSignal,
  children,
}: CollapsibleBlockProps) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (expandSignal !== undefined) setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandSignal]);

  useEffect(() => {
    if (collapseSignal !== undefined) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapseSignal]);

  return (
    <div className={`block-row${open ? " open" : ""}`}>
      <button
        type="button"
        className="block-row-head"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="block-row-index">{index}</span>
        <span className="block-row-name">{title}</span>
        <span className="block-row-summary">{summary}</span>
        <span className="block-row-chevron">{open ? "–" : "+"}</span>
      </button>
      {open && <div className="block-row-body">{children}</div>}
    </div>
  );
}
