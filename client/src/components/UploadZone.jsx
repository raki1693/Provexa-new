import { useState, useRef } from 'react';
import { CloudArrowUpIcon, XMarkIcon, DocumentIcon } from '@heroicons/react/24/outline';

export default function UploadZone({ onFileSelect, accept = '.xlsx,.xls,.csv', label = 'Upload Excel / CSV' }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    onFileSelect(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleRemove = () => {
    setFile(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragging
              ? 'border-provexa-blue bg-provexa-lightblue'
              : 'border-gray-300 bg-gray-50 hover:border-provexa-blue hover:bg-provexa-lightblue'
          }`}
        >
          <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700">{label}</p>
          <p className="text-xs text-gray-400 mt-1">Drag & drop or click to browse</p>
          <p className="text-xs text-gray-400 mt-1">Supports: .xlsx, .xls, .csv (max 5MB)</p>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="flex items-center gap-4 border border-green-200 bg-green-50 rounded-xl p-4">
          <DocumentIcon className="w-8 h-8 text-provexa-green flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
          </div>
          <button onClick={handleRemove} className="p-1.5 hover:bg-red-100 rounded-lg transition-colors">
            <XMarkIcon className="w-5 h-5 text-red-500" />
          </button>
        </div>
      )}
    </div>
  );
}
