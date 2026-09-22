import React, { useState, useRef } from 'react';
import { Upload, X, Check, Sparkles, FolderOpen } from 'lucide-react';

export interface ImageUploadPickerProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  placeholderText?: string;
  aspectRatio?: 'square' | 'wide' | 'auto';
  helperText?: string;
  allowLibraryPick?: boolean;
}

// Curated library of bundled high-res family avatars & photos
const BUNDLED_FAMILY_LIBRARY = [
  { name: 'Prasad (Patient)', role: 'Self', path: '/images/family/patient.jpeg' },
  { name: 'Sunita', role: 'Wife', path: '/images/family/wife.jpeg' },
  { name: 'Ravi', role: 'Son', path: '/images/family/son.jpeg' },
  { name: 'Meera', role: 'Daughter', path: '/images/family/daughter.webp' },
  { name: 'Biren', role: '1st Brother', path: '/images/family/brother-1.jpeg' },
  { name: 'Kamla', role: "1st Brother's Wife", path: '/images/family/brother-1-wife.jpeg' },
  { name: 'Arun', role: 'Grandson', path: '/images/family/brother-1-son.jpeg' },
  { name: 'Pooja', role: "1st Brother's Daughter", path: '/images/family/brother-1-daughter.jpeg' },
  { name: 'Vikram', role: '2nd Brother', path: '/images/family/brother-2.jpeg' },
  { name: 'Asha', role: "2nd Brother's Wife", path: '/images/family/brother-2-wife.jpeg' },
  { name: 'Dr. Haren Barua', role: 'Doctor', path: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80' },
  { name: 'JYOTHIKA', role: 'Spouse', path: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80' }
];

export const ImageUploadPicker: React.FC<ImageUploadPickerProps> = ({
  value = '',
  onChange,
  label = 'Photo',
  placeholderText = 'Browse image from your device or pick from gallery',
  aspectRatio = 'square',
  helperText = 'Supports JPG, PNG, WEBP from your phone, tablet, or laptop.',
  allowLibraryPick = true
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read local file -> Base64 for instant zero-latency UI + try backend upload
  const handleFile = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP, etc.)');
      return;
    }

    // 1. Instant optimistic local preview (Base64 data URL)
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onChange(dataUrl);
      }
    };
    reader.readAsDataURL(file);

    // 2. Try background upload to backend /api/upload
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api';
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          onChange(data.url);
        }
      }
    } catch (err) {
      console.warn('[ImageUploadPicker] Backend upload bypassed, offline Data URL retained:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
            {label}
          </label>
          {allowLibraryPick && (
            <button
              type="button"
              onClick={() => setIsLibraryOpen(!isLibraryOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: '#0f766e',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.1rem 0.3rem'
              }}
            >
              <Sparkles size={13} />
              {isLibraryOpen ? 'Close Library' : 'Family Photo Library'}
            </button>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onFileInputChange}
      />

      {/* If an image is selected: show preview card with replace/remove controls */}
      {value ? (
        <div
          style={{
            position: 'relative',
            background: '#f8fafc',
            border: '2px solid #0f766e',
            borderRadius: '16px',
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 4px 12px rgba(15, 118, 110, 0.08)'
          }}
        >
          <img
            src={value}
            alt="Uploaded Preview"
            style={{
              width: aspectRatio === 'wide' ? '90px' : '64px',
              height: '64px',
              objectFit: 'cover',
              borderRadius: '12px',
              border: '2px solid #cbd5e1'
            }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f766e', fontWeight: 800, fontSize: '0.9rem' }}>
              <Check size={16} /> Photo Selected
            </div>
            <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isUploading ? 'Syncing to local storage...' : (value.startsWith('data:') ? 'Custom device photo' : value)}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: '#e0f2fe',
                color: '#0284c7',
                border: 'none',
                borderRadius: '10px',
                padding: '0.4rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <FolderOpen size={13} /> Change
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              title="Remove photo"
              style={{
                background: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                borderRadius: '10px',
                padding: '0.4rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        /* Upload / Browse Dropzone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? '#0f766e' : '#cbd5e1'}`,
            background: isDragging ? '#f0fdfa' : '#f8fafc',
            borderRadius: '16px',
            padding: '1.25rem 1rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#ccfbf1',
              color: '#0f766e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Upload size={22} />
          </div>

          <div>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
              📁 Browse Image from Device
            </div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.15rem' }}>
              {placeholderText}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', background: '#e2e8f0', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 600 }}>
              Device Gallery / Camera
            </span>
          </div>
        </div>
      )}

      {/* Expandable Family Photo Library Drawer */}
      {allowLibraryPick && isLibraryOpen && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.85rem',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '14px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.06)'
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.6rem' }}>
            Quick-Select from Family Album ({BUNDLED_FAMILY_LIBRARY.length} available):
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
              gap: '0.6rem',
              maxHeight: '180px',
              overflowY: 'auto'
            }}
          >
            {BUNDLED_FAMILY_LIBRARY.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onChange(item.path);
                  setIsLibraryOpen(false);
                }}
                style={{
                  cursor: 'pointer',
                  border: value === item.path ? '2px solid #0f766e' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '0.35rem',
                  textAlign: 'center',
                  background: value === item.path ? '#f0fdfa' : '#ffffff',
                  transition: 'transform 0.15s ease'
                }}
                title={`${item.name} (${item.role})`}
              >
                <img
                  src={item.path}
                  alt={item.name}
                  style={{
                    width: '100%',
                    height: '52px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '0.25rem'
                  }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                  {item.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {helperText && (
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem' }}>
          {helperText}
        </div>
      )}
    </div>
  );
};
