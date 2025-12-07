// ============================================================================
// --- FILE: src/components/common/BulkPreviewModal.jsx ---
// ============================================================================
import React, { useState, useMemo } from "react";
import { X, Database, AlertCircle, CheckCircle2, Zap } from "lucide-react";

// Lightweight Virtual Table for high performance
const VirtualTable = ({ data, columns, height = 400, rowHeight = 40 }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const totalHeight = data.length * rowHeight;
  
  // Calculate visible range based on scroll position
  const startIndex = Math.floor(scrollTop / rowHeight);
  const endIndex = Math.min(
    data.length,
    startIndex + Math.ceil(height / rowHeight) + 5 // Buffer
  );

  const visibleItems = useMemo(() => {
    return data.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      virtualIndex: startIndex + index,
      top: (startIndex + index) * rowHeight,
    }));
  }, [data, startIndex, endIndex, rowHeight]);

  return (
    <div 
      className="border rounded-md overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 relative"
      style={{ height }}
    >
      {/* Header */}
      <div className="flex bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 absolute top-0 w-full z-10 h-10 font-bold text-xs uppercase text-gray-500">
        <div className="w-16 px-4 flex items-center border-r dark:border-gray-700">#</div>
        {columns.map((col) => (
          <div key={col.key} className="flex-1 px-4 flex items-center border-r dark:border-gray-700 last:border-0 truncate">
            {col.label}
          </div>
        ))}
      </div>

      {/* Scrollable Body */}
      <div 
        className="overflow-y-auto h-full custom-scrollbar pt-10"
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          {visibleItems.map((row) => (
            <div
              key={row.virtualIndex}
              className="absolute w-full flex border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm"
              style={{ top: row.top, height: rowHeight }}
            >
              <div className="w-16 px-4 flex items-center border-r dark:border-gray-700 text-gray-400 font-mono text-xs">
                {row.virtualIndex + 1}
              </div>
              {columns.map((col) => (
                <div key={col.key} className="flex-1 px-4 flex items-center border-r dark:border-gray-700 last:border-0 truncate text-gray-700 dark:text-gray-300">
                  {/* Handle Objects/Nulls safely */}
                  {typeof row[col.key] === 'object' ? JSON.stringify(row[col.key]) : (row[col.key] || "-")}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BulkPreviewModal = ({ isOpen, onClose, data, onConfirm, isProcessing }) => {
  if (!isOpen) return null;

  // Auto-detect columns from the first row
  const columns = data.length > 0 
    ? Object.keys(data[0]).slice(0, 8).map(k => ({ key: k, label: k.replace(/_/g, " ") })) // Limit to 8 cols for preview
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 w-full max-w-6xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              Data Import Preview
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Previewing sample of fetched data.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-hidden flex flex-col gap-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200 px-4 py-3 rounded-lg text-sm flex gap-2 items-center">
            <AlertCircle className="w-4 h-4" />
            <span>
              This is a <span className="font-bold">sample preview</span>. The actual sync will process data in streams to handle 1 Cr+ records efficiently.
            </span>
          </div>
          
          <VirtualTable data={data} columns={columns} height={500} />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3 rounded-b-xl">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-white border border-transparent hover:border-gray-300 rounded-lg transition-all"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg shadow-lg flex items-center gap-2 transition-all active:scale-95 ${
                isProcessing 
                ? 'bg-gray-400 cursor-not-allowed text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/30'
            }`}
          >
            {isProcessing ? (
              <><Zap className="w-4 h-4 animate-pulse" /> Processing Stream...</>
            ) : (
              <><CheckCircle2 className="w-4 h-4" /> Confirm & Start Sync</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkPreviewModal;