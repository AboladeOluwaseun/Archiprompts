"use client";

import { useEffect, useRef, useState } from "react";

interface ModelUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
  refStrength: "strict" | "balanced" | "loose";
  onRefStrengthChange: (value: "strict" | "balanced" | "loose") => void;
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 15 * 1024 * 1024;

const STRENGTHS: { value: "strict" | "balanced" | "loose"; label: string }[] = [
  { value: "strict", label: "Strict — follow the massing exactly" },
  { value: "balanced", label: "Balanced — massing plus refinement" },
  { value: "loose", label: "Loose — guidance only" },
];

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

export default function ModelUpload({
  file,
  onChange,
  refStrength,
  onRefStrengthChange,
}: ModelUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [uploadedAt] = useState(() => Date.now());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setDims(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    const img = new Image();
    img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFiles = (files: FileList | null) => {
    const picked = files?.[0];
    if (!picked) return;

    if (!ACCEPTED_TYPES.includes(picked.type)) {
      setError("Please upload a PNG or JPG screenshot.");
      return;
    }
    if (picked.size > MAX_BYTES) {
      setError("File is too large — max 8 MB.");
      return;
    }

    setError(null);
    onChange(picked);
  };

  return (
    <div className="ref-geometry">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="model-upload-input"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {!file ? (
        <div className="ref-geometry-empty">
          <div className="ref-geometry-empty-copy">
            <div className="ref-geometry-empty-title">
              Drop a model screenshot to lock the geometry
            </div>
            <div className="ref-geometry-empty-body">
              A Revit, SketchUp or 3ds Max viewport capture switches
              rendering to image-to-image, so the massing you modelled is
              the massing you get. Without one, the prompt text is all the
              model has to go on.
            </div>
          </div>
          <div className="ref-geometry-empty-action">
            <button
              type="button"
              className="ref-geometry-browse-btn"
              onClick={() => inputRef.current?.click()}
            >
              Browse files
            </button>
            <span className="ref-geometry-constraints">
              PNG or JPG · up to 8 MB · one image
            </span>
          </div>
        </div>
      ) : (
        <div className="ref-geometry-filled">
          <div className="ref-geometry-filled-row">
            {previewUrl && (
              <div className="ref-geometry-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Uploaded model reference" />
                <span>viewport capture</span>
              </div>
            )}
            <div className="ref-geometry-meta">
              <div className="ref-geometry-meta-head">
                <span className="ref-geometry-filename">{file.name}</span>
                <span className="ref-geometry-badge">IMAGE-TO-IMAGE</span>
              </div>
              <div className="ref-geometry-dims">
                {dims ? `${dims.w} × ${dims.h}` : "…"} · uploaded{" "}
                {formatDate(uploadedAt)} · /v1/images/edits
              </div>
              <div className="ref-geometry-actions">
                <label className="ref-geometry-strength-field">
                  <span>How closely to follow it</span>
                  <select
                    value={refStrength}
                    onChange={(e) =>
                      onRefStrengthChange(
                        e.target.value as "strict" | "balanced" | "loose",
                      )
                    }
                  >
                    {STRENGTHS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="ref-geometry-btn"
                  onClick={() => inputRef.current?.click()}
                >
                  Replace
                </button>
                <button
                  type="button"
                  className="ref-geometry-btn muted"
                  onClick={() => {
                    onChange(null);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
          <div className="ref-geometry-explain">
            The attached reference image is the authority on massing,
            proportion and openings — the prompt says so explicitly.
          </div>
        </div>
      )}

      {error && <div className="model-upload-error">{error}</div>}
    </div>
  );
}
