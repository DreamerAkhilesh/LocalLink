import React, { useRef, useState } from 'react';
import axios from 'axios';

/**
 * ImageUploader
 * Drop-zone + file browse UI for uploading product/service images.
 *
 * The upload call uses a fresh axios instance (NOT the shared api singleton)
 * so that the shared default Content-Type: application/json header never
 * interferes with multipart/form-data boundary — that header must be left
 * unset so the browser sets it with the correct boundary string.
 *
 * Props:
 *   images   – string[]  current image URLs (can be remote or /uploads/...)
 *   onChange – (urls: string[]) => void   called with the updated array
 *   max      – number   max images allowed (default 4)
 */
const ImageUploader = ({ images = [], onChange, max = 4 }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const uploadFile = async (file) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be under 5 MB.');
      return;
    }
    if (images.length >= max) {
      setUploadError(`Maximum ${max} images allowed.`);
      return;
    }

    setUploadError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Use plain axios — NOT the api instance — so no Content-Type default
      // is set. Axios / the browser then automatically supplies:
      //   Content-Type: multipart/form-data; boundary=----WebKit...
      // which multer needs to parse the file.
      const token = localStorage.getItem('token');
      // Derive the upload URL from the same env var that api.js uses.
      // In development (no env var) this becomes '/api/upload' and the
      // CRA proxy forwards it to the backend.
      // In production set REACT_APP_API_URL=https://your-backend/api
      const apiBase = process.env.REACT_APP_API_URL || '/api';
      const res = await axios.post(`${apiBase}/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 60000,
      });

      const url = res.data.data.url;
      onChange([...images, url]);
    } catch (err) {
      setUploadError(
        err.response?.data?.message || 'Upload failed. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(uploadFile);
    e.target.value = ''; // reset so same file can be re-selected
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    files.forEach(uploadFile);
  };

  const removeImage = (idx) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Existing images */}
      {images.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {images.map((url, idx) => (
            <div
              key={idx}
              style={{
                position: 'relative', width: 100, height: 100,
                borderRadius: 10, overflow: 'hidden',
                border: '2px solid var(--border)',
                background: 'var(--bg-deep)', flexShrink: 0,
              }}
            >
              <img
                src={url}
                alt={`Image ${idx + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => {
                  e.target.src =
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="1.5"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpath d="M21 15l-5-5L5 21"/%3E%3C/svg%3E';
                }}
              />
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeImage(idx)}
                aria-label="Remove image"
                style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '0.75rem', lineHeight: 1,
                }}
              >
                ✕
              </button>
              {/* Thumbnail label */}
              {idx === 0 && (
                <span style={{
                  position: 'absolute', bottom: 4, left: 4,
                  background: 'rgba(124,58,237,0.85)', color: 'white',
                  fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                }}>
                  MAIN
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload zone — hide when max reached */}
      {images.length < max && (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? 'var(--accent)' : uploadError ? 'var(--danger)' : 'rgba(124,58,237,0.3)'}`,
            borderRadius: 14,
            padding: '22px 16px',
            textAlign: 'center',
            cursor: uploading ? 'wait' : 'pointer',
            background: dragOver ? 'rgba(124,58,237,0.06)' : 'rgba(124,58,237,0.02)',
            transition: 'all 0.2s',
            userSelect: 'none',
          }}
        >
          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
              <span style={{ fontSize: '0.84rem', color: 'var(--muted)' }}>Uploading…</span>
            </div>
          ) : (
            <>
              {/* Cloud upload icon */}
              <div style={{ marginBottom: 8 }}>
                <svg
                  width="36" height="36" viewBox="0 0 24 24" fill="none"
                  stroke={dragOver ? 'var(--accent)' : 'var(--muted)'}
                  strokeWidth="1.5"
                  style={{ display: 'inline-block' }}
                >
                  <polyline points="16 16 12 12 8 16" />
                  <line x1="12" y1="12" x2="12" y2="21" />
                  <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
                </svg>
              </div>
              <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>
                {dragOver ? 'Drop to upload' : 'Click to browse or drag & drop'}
              </p>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--muted)' }}>
                JPG, PNG, WebP · up to 5 MB · {images.length}/{max} uploaded
              </p>
            </>
          )}
        </div>
      )}

      {/* Hidden file input — accepts multiple files */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileInput}
      />

      {uploadError && (
        <p style={{ margin: 0, color: 'var(--danger)', fontSize: '0.82rem' }}>{uploadError}</p>
      )}
    </div>
  );
};

export default ImageUploader;
