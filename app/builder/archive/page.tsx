"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase";
import {
  HistoryEntry,
  fetchHistory,
  deleteHistoryEntry,
  updateHistoryProjectName,
} from "@/lib/history";
import ThemeToggle from "@/components/ThemeToggle";

export default function ArchivePage() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const sb = getSupabaseBrowser();
      if (!sb) {
        setSignedIn(false);
        setLoading(false);
        return;
      }
      const { data } = await sb.auth.getSession();
      if (!data.session) {
        setSignedIn(false);
        setLoading(false);
        return;
      }
      setSignedIn(true);
      setEntries(await fetchHistory(200));
      setLoading(false);
    };
    load();
  }, []);

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
        prev.map((e) => (e.id === id ? { ...e, project_name: value.trim() || null } : e)),
      );
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const ok = await deleteHistoryEntry(id);
    if (ok) setEntries((prev) => prev.filter((e) => e.id !== id));
    setDeletingId(null);
  };

  return (
    <div className="archive-page">
      <div className="page-toolbar">
        <Link href="/builder" className="projects-back">
          ← Back to builder
        </Link>
        <ThemeToggle />
      </div>

      <div className="lineage-eyebrow">ARCHIVE</div>
      <h1 className="lineage-title">Every prompt, restorable</h1>
      <p className="lineage-sub">
        Restoring brings back the whole form state, not just the text. Project tags are
        editable in place, including retroactively.
      </p>

      {loading && <div className="projects-empty">Loading…</div>}

      {!loading && signedIn === false && (
        <div className="projects-empty">Sign in from the builder to see your archive.</div>
      )}

      {!loading && signedIn && entries.length === 0 && (
        <div className="archive-empty">
          <h2>Nothing saved yet.</h2>
          <p>
            Every prompt you generate lands here automatically, whether or
            not you rendered it. Saving is not a separate action you can
            forget.
          </p>
          <div className="archive-empty-skeleton">
            <div className="archive-empty-skeleton-row">
              <span>— —</span>
              <span>your first prompt will appear here</span>
            </div>
            <div className="archive-empty-skeleton-row dim">
              <span>— —</span>
              <span>and the one after it</span>
            </div>
          </div>
        </div>
      )}

      {!loading && signedIn && entries.length > 0 && (
        <div className="archive-table">
          <div className="archive-row archive-head">
            <span>DATE</span>
            <span>PROMPT</span>
            <span>PROJECT TAG</span>
            <span>RENDER</span>
            <span></span>
          </div>
          {entries.map((entry) => (
            <div key={entry.id} className="archive-row">
              <span className="archive-date">
                {new Date(entry.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <div className="archive-prompt">
                <div className="archive-prompt-title">{entry.summary}</div>
                <div className="archive-prompt-excerpt">
                  {entry.prompt_text.slice(0, 90)}…
                </div>
              </div>
              {editingId === entry.id ? (
                <input
                  type="text"
                  className="archive-tag-input"
                  value={editValue}
                  placeholder="untagged"
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
                  className="archive-tag-btn"
                  onClick={() => startEditing(entry)}
                >
                  {entry.project_name || "+ untagged"}
                </button>
              )}
              <div className="archive-render">
                {entry.rendered_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="archive-render-thumb" src={entry.rendered_image_url} alt="" />
                ) : (
                  <div className="archive-render-thumb placeholder" />
                )}
                <span className="archive-render-label">
                  {entry.rendered_image_url ? "rendered" : "no render"}
                </span>
              </div>
              <div className="archive-actions">
                <Link href={`/builder?restore=${entry.id}`} className="btn-sm">
                  Restore
                </Link>
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
      )}
    </div>
  );
}
