"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase";
import { fetchHistory, HistoryEntry } from "@/lib/history";

interface ProjectGroup {
  name: string | null;
  entries: HistoryEntry[];
  lastUpdated: string;
}

function groupByProject(entries: HistoryEntry[]): ProjectGroup[] {
  const map = new Map<string, HistoryEntry[]>();
  const untagged: HistoryEntry[] = [];

  for (const entry of entries) {
    if (!entry.project_name) {
      untagged.push(entry);
      continue;
    }
    const list = map.get(entry.project_name) || [];
    list.push(entry);
    map.set(entry.project_name, list);
  }

  const groups: ProjectGroup[] = Array.from(map.entries()).map(([name, list]) => ({
    name,
    entries: list,
    lastUpdated: list[0]?.created_at || "",
  }));

  groups.sort((a, b) => (a.lastUpdated < b.lastUpdated ? 1 : -1));

  if (untagged.length > 0) {
    groups.push({ name: null, entries: untagged, lastUpdated: untagged[0]?.created_at || "" });
  }

  return groups;
}

export default function ProjectsPage() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [groups, setGroups] = useState<ProjectGroup[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

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

      const entries = await fetchHistory(200);
      setGroups(groupByProject(entries));
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="projects-page">
      <div className="projects-header">
        <Link href="/builder" className="projects-back">
          ← Back to Builder
        </Link>
        <h1>
          Your <span className="projects-title-accent">Projects</span>
        </h1>
        <p>
          Every render you've generated, grouped by project — so views of the
          same building stay together without digging through Archive.
        </p>
      </div>

      {loading && <div className="projects-empty">Loading…</div>}

      {!loading && signedIn === false && (
        <div className="projects-empty">
          Sign in from the builder to see your projects.
        </div>
      )}

      {!loading && signedIn && groups.length === 0 && (
        <div className="projects-empty">
          No renders yet — generate one in the builder and give it a project
          name to see it here.
        </div>
      )}

      {!loading && signedIn && groups.length > 0 && (
        <div className="projects-grid">
          {groups.map((group) => {
            const key = group.name ?? "__ungrouped__";
            const isOpen = expanded === key;
            const thumbs = group.entries
              .filter((e) => e.rendered_image_url)
              .slice(0, 4);

            return (
              <div key={key} className={`project-card${isOpen ? " open" : ""}`}>
                <button
                  type="button"
                  className="project-card-header"
                  onClick={() => setExpanded(isOpen ? null : key)}
                >
                  <div className="project-card-thumbs">
                    {thumbs.length > 0 ? (
                      thumbs.map((t) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={t.id} src={t.rendered_image_url!} alt="" />
                      ))
                    ) : (
                      <div className="project-card-thumb-placeholder">No renders yet</div>
                    )}
                  </div>
                  <div className="project-card-meta">
                    <div className="project-card-name">
                      {group.name ?? "Ungrouped"}
                    </div>
                    <div className="project-card-count">
                      {group.entries.length} prompt{group.entries.length === 1 ? "" : "s"}
                    </div>
                  </div>
                  <span className="project-card-chevron">{isOpen ? "▲" : "▼"}</span>
                </button>

                {isOpen && (
                  <div className="project-card-body">
                    {group.name && (
                      <Link
                        href={`/builder?newForProject=${encodeURIComponent(group.name)}`}
                        className="project-new-render"
                      >
                        + New Render for {group.name}
                      </Link>
                    )}
                    <div className="project-entry-list">
                      {group.entries.map((entry) => (
                        <div key={entry.id} className="project-entry">
                          {entry.rendered_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              className="project-entry-thumb"
                              src={entry.rendered_image_url}
                              alt=""
                            />
                          ) : (
                            <div className="project-entry-thumb placeholder" />
                          )}
                          <div className="project-entry-main">
                            <div className="project-entry-summary">{entry.summary}</div>
                            <div className="project-entry-date">
                              {new Date(entry.created_at).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                          <Link
                            href={`/builder?restore=${entry.id}`}
                            className="btn-sm"
                          >
                            Load
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
