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

  const isEmpty = !loading && signedIn && groups.length === 0;

  return (
    <div className="projects-page">
      <Link href="/builder" className="projects-back">
        ← Back to builder
      </Link>

      <div className="projects-header">
        <div>
          <div className="projects-eyebrow">PROJECTS</div>
          <h1>Renders grouped by building</h1>
        </div>
        <Link href="/builder" className="projects-new-btn">
          New render
        </Link>
      </div>

      {loading && <div className="projects-empty-body">Loading…</div>}

      {!loading && signedIn === false && (
        <div className="projects-empty-body">
          Sign in from the builder to see your projects.
        </div>
      )}

      {isEmpty && (
        <div className="projects-empty">
          <div className="projects-empty-box" />
          <div className="projects-empty-body">
            <h2>No projects yet.</h2>
            <p>
              A project is created the first time you name one in the
              builder. Renders that share a project also share style
              references, which is what keeps four views looking like one
              building.
            </p>
            <Link href="/builder" className="project-new-render">
              Build your first prompt
            </Link>
          </div>
        </div>
      )}

      {!loading && signedIn && groups.length > 0 && (
        <div className="projects-grid">
          {groups.map((group) => {
            const key = group.name ?? "__ungrouped__";
            const isOpen = expanded === key;
            const renderedCount = group.entries.filter((e) => e.rendered_image_url).length;
            const styleRefsActive = renderedCount >= 2;

            return (
              <div key={key} className={`project-card${isOpen ? " open" : ""}`}>
                <button
                  type="button"
                  className="project-card-header"
                  onClick={() => setExpanded(isOpen ? null : key)}
                >
                  <div className="project-card-meta">
                    <div className="project-card-name-row">
                      <div className="project-card-name">
                        {group.name ?? "Ungrouped"}
                      </div>
                    </div>
                    <div className="project-card-count">
                      {group.entries.length} prompt{group.entries.length === 1 ? "" : "s"} ·{" "}
                      {renderedCount} render{renderedCount === 1 ? "" : "s"}
                    </div>
                  </div>
                  {styleRefsActive && (
                    <span className="style-refs-badge">STYLE REFS ACTIVE</span>
                  )}
                  <span className="project-card-chevron">{isOpen ? "–" : "+"}</span>
                </button>

                {isOpen && (
                  <div className="project-card-body">
                    {renderedCount === 0 && (
                      <div className="project-no-views">
                        <strong>Nothing rendered here yet.</strong>
                        <span>
                          The first render in a project has no style
                          references to inherit, so it is judged on the
                          prompt alone. Every render after it borrows the
                          two most recent images.
                        </span>
                      </div>
                    )}
                    <div className="project-views-grid">
                      {group.entries.map((entry) => (
                        <Link
                          key={entry.id}
                          href={`/builder?restore=${entry.id}`}
                          className="project-view-tile"
                          title={entry.summary}
                        >
                          {entry.rendered_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={entry.rendered_image_url} alt="" />
                          ) : (
                            <div className="project-view-tile-placeholder" />
                          )}
                          <span className="project-view-tile-label">{entry.summary}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="project-new-render-row">
                      {group.name && (
                        <Link
                          href={`/builder?newForProject=${encodeURIComponent(group.name)}`}
                          className="project-new-render"
                        >
                          Add a view to this project
                        </Link>
                      )}
                      <span className="project-new-render-hint">
                        New renders here inherit the two most recent images
                        as style references.
                      </span>
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
