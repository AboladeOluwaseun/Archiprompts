"use client";

import { useEffect, useState } from "react";
import { HistoryEntry, fetchHistory, deleteHistoryEntry } from "@/lib/history";

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  onRestore: (entry: HistoryEntry) => void;
}

export default function HistoryModal({ open, onClose, onRestore }: HistoryModalProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchHistory().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, [open]);

  if (!open) return null;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const ok = await deleteHistoryEntry(id);
    if (ok) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
    setDeletingId(null);
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

        <div className="history-list">
          {loading && <div className="history-empty">Loading…</div>}

          {!loading && entries.length === 0 && (
            <div className="history-empty">
              No saved prompts yet — generate one and it'll show up here.
            </div>
          )}

          {!loading &&
            entries.map((entry) => (
              <div key={entry.id} className="history-item">
                <div className="history-item-main">
                  <div className="history-item-top">
                    <span className="history-item-mode">
                      {entry.builder_mode === "interior" ? "🛋️ Interior" : "🏛️ Exterior"}
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
