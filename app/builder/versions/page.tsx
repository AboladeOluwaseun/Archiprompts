"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchHistoryEntryById, HistoryEntry } from "@/lib/history";
import { fetchRenderVariants, RenderVariant } from "@/lib/renderVariants";

interface LineageNode extends RenderVariant {
  depth: number;
}

// Depth is walked from parent_variant_id rather than assumed from array
// order, so a branch (two children off the same parent) still indents
// correctly instead of just reflecting insertion order.
function buildLineage(variants: RenderVariant[]): LineageNode[] {
  const depthOf = (id: string | null, seen = new Set<string>()): number => {
    if (!id) return 0;
    if (seen.has(id)) return 0; // guard against any accidental cycle
    seen.add(id);
    const parent = variants.find((v) => v.id === id);
    if (!parent) return 0;
    return 1 + depthOf(parent.parent_variant_id, seen);
  };

  return variants
    .slice()
    .sort((a, b) => (a.created_at < b.created_at ? -1 : 1))
    .map((v) => ({ ...v, depth: depthOf(v.parent_variant_id) }));
}

function VersionsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const entryId = searchParams.get("entry");

  const [entry, setEntry] = useState<HistoryEntry | null>(null);
  const [variants, setVariants] = useState<RenderVariant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entryId) {
      setLoading(false);
      return;
    }
    Promise.all([fetchHistoryEntryById(entryId), fetchRenderVariants(entryId)]).then(
      ([entryData, variantData]) => {
        setEntry(entryData);
        setVariants(variantData);
        setLoading(false);
      },
    );
  }, [entryId]);

  const lineage = buildLineage(variants);

  return (
    <div className="lineage-page">
      <Link href="/builder" className="projects-back">
        ← Back to Builder
      </Link>

      <div className="lineage-eyebrow">
        VERSION LINEAGE{entry?.project_name ? ` · ${entry.project_name.toUpperCase()}` : ""}
      </div>
      <h1 className="lineage-title">
        {lineage.length > 1
          ? `${lineage.length} variants, one prompt.`
          : "This render has no branches yet."}
      </h1>
      <p className="lineage-sub">
        Refining never overwrites. Each pass writes a new variant that remembers which
        one it came from, so a branch that went wrong costs you nothing.
      </p>

      {loading && <div className="projects-empty">Loading…</div>}

      {!loading && !entryId && (
        <div className="projects-empty">
          No render selected — open Lineage from a render's version strip on the Render tab.
        </div>
      )}

      {!loading && entryId && lineage.length === 0 && (
        <div className="projects-empty">No renders yet for this prompt.</div>
      )}

      {!loading && lineage.length > 0 && (
        <div className="lineage-tree">
          {lineage.map((node, i) => (
            <div key={node.id} className="lineage-row">
              <div className="lineage-rail">
                <span className="lineage-rail-line" />
                <span className="lineage-rail-dot" />
              </div>
              <div className="lineage-card" style={{ marginLeft: node.depth * 24 }}>
                <div className="lineage-card-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={node.image_url} alt={node.label} />
                </div>
                <div className="lineage-card-body">
                  <div className="lineage-card-top">
                    <span className="lineage-version-badge">V{i + 1}</span>
                    <span className="lineage-card-title">{node.label}</span>
                    <span className="lineage-card-from">
                      {node.parent_variant_id ? "from a previous version" : "root"}
                    </span>
                  </div>
                  <div className="lineage-card-date">
                    {new Date(node.created_at).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <button
                    type="button"
                    className="btn-sm secondary"
                    onClick={() =>
                      router.push(`/builder?restore=${entryId}&variant=${node.id}`)
                    }
                  >
                    Make active
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="lineage-footnote">
        parent_variant_id is what makes the indent real — a branch indents off its
        actual parent, not off the newest image.
      </div>
    </div>
  );
}

export default function VersionsPage() {
  return (
    <Suspense fallback={null}>
      <VersionsPageInner />
    </Suspense>
  );
}
