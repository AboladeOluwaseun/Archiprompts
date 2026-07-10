"use client";

import { useEffect, useRef, useState } from "react";

interface ModelUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 15 * 1024 * 1024;

export default function ModelUpload({ file, onChange }: ModelUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFiles = (files: FileList | null) => {
    const picked = files?.[0];
    if (!picked) return;

    if (!ACCEPTED_TYPES.includes(picked.type)) {
      setError("Please upload a PNG, JPEG, or WebP screenshot.");
      return;
    }
    if (picked.size > MAX_BYTES) {
      setError("File is too large — max 15MB.");
      return;
    }

    setError(null);
    onChange(picked);
  };

  return (
    <div className="model-upload">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="model-upload-input"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {!file ? (
        <button
          type="button"
          className="model-upload-dropzone"
          onClick={() => inputRef.current?.click()}
        >
          <span className="model-upload-icon-circle" aria-hidden>
            📐
          </span>
          <span className="model-upload-label">
            Upload Revit / SketchUp / 3ds Max screenshot
          </span>
          <span className="model-upload-browse-btn">Browse Files</span>
          <span className="model-upload-hint">
            PNG, JPEG, or WebP · used as the geometric reference for
            rendering
          </span>
        </button>
      ) : (
        <div className="model-upload-preview">
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Uploaded model reference" />
          )}
          <div className="model-upload-meta">
            <span className="model-upload-filename">{file.name}</span>
            <button
              type="button"
              className="model-upload-remove"
              onClick={() => {
                onChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {error && <div className="model-upload-error">{error}</div>}
    </div>
  );
}
