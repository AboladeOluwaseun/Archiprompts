"use client";

import { useEffect, useState } from "react";
import {
  HistoryEntry,
  fetchHistory,
  deleteHistoryEntry,
  updateHistoryProjectName,
} from "@/lib/history";

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  onRestore: (entry: HistoryEntry) => void;
}

export default function HistoryModal({ open, onClose, onRestore }: HistoryModalProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setProjectFilter("");
    fetchHistory().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, [open]);

  if (!open) return null;

  const projectNames = Array.from(
    new Set(entries.map((e) => e.project_name).filter((p): p is string => !!p)),
  );

  const visibleEntries = projectFilter
    ? entries.filter((e) => e.project_name === projectFilter)
    : entries;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const ok = await deleteHistoryEntry(id);
    if (ok) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
    setDeletingId(null);
  };

  const startEditing = (entry: HistoryEntry) => {
    setEditingId(entry.id);
    setEditValue(entry.project_name || "");
  };

  const saveProjectName = async (id: string) => {
    const value = editValue;
    setEditingId(null);
    const ok = await updateHistoryProjectName(id, value);
    if (ok) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, project_name: value.trim() || null } : e,
        ),
      );
    }
  };

  return (
    <div
      className="modal-wrap open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal history-modal">
        <button className="m-close" onClick={onClose}>
          ×
        </button>

        <div className="m-head">
          <h2>
            Prompt{" "}
            <span style={{ color: "var(--gold)", fontStyle: "italic" }}>
              Archive
            </span>
          </h2>
          <p>Every prompt you've generated while signed in, saved automatically.</p>
        </div>

        {projectNames.length > 0 && (
          <div className="history-filter">
            <label>Project</label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            >
              <option value="">All Projects</option>
              {projectNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="history-list">
          {loading && <div className="history-empty">Loading…</div>}

          {!loading && entries.length === 0 && (
            <div className="history-empty">
              No saved prompts yet — generate one and it'll show up here.
            </div>
          )}

          {!loading && entries.length > 0 && visibleEntries.length === 0 && (
            <div className="history-empty">No saved prompts for this project.</div>
          )}

          {!loading &&
            visibleEntries.map((entry) => (
              <div key={entry.id} className="history-item">
                {entry.rendered_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.rendered_image_url}
                    alt=""
                    className="history-item-thumb"
                  />
                )}
                <div className="history-item-main">
                  <div className="history-item-top">
                    <span className="history-item-tags">
                      <span className="history-item-mode">
                        {entry.builder_mode === "interior" ? "🛋️ Interior" : "🏛️ Exterior"}
                      </span>
                      {editingId === entry.id ? (
                        <input
                          type="text"
                          className="history-item-project-input"
                          value={editValue}
                          placeholder="Project name…"
                          autoFocus
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveProjectName(entry.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveProjectName(entry.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                      ) : (
                        <button
                          type="button"
                          className="history-item-project"
                          onClick={() => startEditing(entry)}
                          title="Rename project"
                        >
                          {entry.project_name || "+ Add project"}
                        </button>
                      )}
                    </span>
                    <span className="history-item-date">
                      {new Date(entry.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="history-item-summary">{entry.summary}</div>
                  <div className="history-item-snippet">
                    {entry.prompt_text.slice(0, 120)}…
                  </div>
                </div>
                <div className="history-item-actions">
                  <button
                    type="button"
                    className="btn-sm"
                    onClick={() => onRestore(entry)}
                  >
                    Load
                  </button>
                  <button
                    type="button"
                    className="history-item-delete"
                    disabled={deletingId === entry.id}
                    onClick={() => handleDelete(entry.id)}
                    title="Delete"
                  >
                    {deletingId === entry.id ? "…" : "✕"}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
