import { useRef, useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

interface ImageUploaderProps {
  value?: File | null;
  previewUrl?: string | null;
  onChange: (file: File | null) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function ImageUploader({
  value,
  previewUrl,
  onChange,
  label = 'อัพโหลดรูปภาพ',
  placeholder = 'คลิกหรือลากไฟล์มาวางที่นี่',
  className = '',
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const preview = value ? URL.createObjectURL(value) : previewUrl ?? null;

  const validate = (file: File): string => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'รองรับเฉพาะ JPG, PNG, WebP, GIF';
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `ขนาดไฟล์ต้องไม่เกิน ${MAX_SIZE_MB} MB`;
    }
    return '';
  };

  const handleFile = useCallback(
    (file: File) => {
      const err = validate(file);
      if (err) {
        setError(err);
        return;
      }
      setError('');
      onChange(file);
    },
    [onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setError('');
    onChange(null);
  };

  return (
    <div className={className}>
      {label && (
        <p className="text-stone-700 mb-1.5" style={{ fontSize: 13, fontWeight: 600 }}>
          {label}
        </p>
      )}

      <div
        className="relative"
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#F97316' : '#D6D3D1'}`,
          borderRadius: 16,
          background: dragOver ? '#FFF7ED' : '#FAFAF9',
          cursor: 'pointer',
          overflow: 'hidden',
          transition: 'border-color 0.15s, background 0.15s',
          minHeight: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleChange}
          style={{ display: 'none' }}
        />

        {preview ? (
          <div className="relative w-full">
            <img
              src={preview}
              alt="preview"
              style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }}
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center"
              style={{ color: '#fff' }}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-6 px-4 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              {dragOver ? <Upload size={22} className="text-orange-500" /> : <ImageIcon size={22} className="text-orange-400" />}
            </div>
            <p className="text-stone-500" style={{ fontSize: 13 }}>{placeholder}</p>
            <p className="text-stone-400" style={{ fontSize: 11 }}>JPG · PNG · WebP · GIF · ไม่เกิน {MAX_SIZE_MB} MB</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 mt-1" style={{ fontSize: 12 }}>{error}</p>
      )}
    </div>
  );
}
