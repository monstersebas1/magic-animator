'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface UploadZoneProps {
  onUpload: (base64: string, mediaType: string) => void;
  isLoading: boolean;
}

export default function UploadZone({ onUpload, isLoading }: UploadZoneProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreview(result);
        const base64 = result.split(',')[1];
        const mediaType = file.type;
        onUpload(base64, mediaType);
      };
      reader.readAsDataURL(file);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/png': [], 'image/jpeg': [], 'image/webp': [] },
    maxFiles: 1,
    disabled: isLoading,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative flex flex-col items-center justify-center w-full max-w-2xl mx-auto rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
        ${isDragActive ? 'border-purple-500 bg-purple-500/10 scale-[1.02]' : 'border-[#333] bg-[#111] hover:border-purple-500/50 hover:bg-[#151515]'}
        ${isLoading ? 'opacity-60 pointer-events-none' : ''}
        ${preview ? 'p-4' : 'p-16'}`}
    >
      <input {...getInputProps()} />

      {preview ? (
        <img
          src={preview}
          alt="Uploaded design"
          className="max-h-80 rounded-xl object-contain"
        />
      ) : (
        <>
          <div className="w-16 h-16 mb-6 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <p className="text-lg font-medium text-white mb-2">
            {isDragActive ? 'Drop your design here' : 'Upload your design'}
          </p>
          <p className="text-sm text-zinc-500">PNG, JPG, or WebP</p>
        </>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-purple-400 font-medium">Analyzing design...</span>
          </div>
        </div>
      )}
    </div>
  );
}
