// ============================================================================
// --- FILE: src/components/tables/DataTable.jsx (FIXED) ---
// ============================================================================
import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  ArrowUp, ArrowDown, ArrowUpDown, Filter, Download, Search, 
  Maximize, Minimize, Loader2, Database
} from "lucide-react";

const flattenObject = (obj, prefix = '') => {
  const flattened = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}_${key}` : key;
      if (value === null || value === undefined) flattened[newKey] = value;
      else if (typeof value === 'object' && !Array.isArray(value)) Object.assign(flattened, flattenObject(value, newKey));
      else flattened[newKey] = value;
    }
  }
  return flattened;
};

// --- Virtual Row with Fixed Widths ---
const VirtualRow = ({ row, index, columns, style }) => (
  <div 
    className="flex border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors absolute left-0"
    style={{ ...style, width: '100%' }}
  >
    {/* Sticky Index Column */}
    <div 
      className="flex-shrink-0 text-center text-xs font-bold text-gray-500 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-800 sticky left-0 z-10"
      style={{ width: '56px', minWidth: '56px' }}
    >
      {index + 1}
    </div>
    
    {/* Scrollable Cell Content */}
    {columns.map((col) => {
      const cellValue = row[col.key];
      let content = cellValue;
      if (cellValue === null || cellValue === undefined) content = <span className="text-gray-300">-</span>;
      else if (typeof cellValue === 'object') content = JSON.stringify(cellValue).substring(0, 30) + "...";

      return (
        <div 
          key={col.key} 
          className={`px-4 py-2 text-sm truncate flex items-center border-r border-gray-100 dark:border-gray-800 last:border-0 ${col.align === 'center' ? 'justify-center font-mono text-gray-800 dark:text-gray-200' : 'justify-start text-gray-700 dark:text-gray-300'}`}
          style={{ width: col.width, minWidth: col.width, flexShrink: 0 }}
          title={typeof cellValue === 'string' ? cellValue : ''}
        >
          {col.key === 'udise_code' ? (
            <span className="font-medium text-blue-600 dark:text-blue-400 font-mono">{content}</span>
          ) : content}
        </div>
      );
    })}
  </div>
);

const DataTable = ({ data = [], totalRecords = 0, onLoadMore, isFetching, isFullScreen, toggleFullScreen }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const headerScrollRef = useRef(null);
  
  const flattenedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map(row => flattenObject(row));
  }, [data]);

  const columns = useMemo(() => {
    if (!flattenedData || flattenedData.length === 0) return [];
    const keys = Object.keys(flattenedData[0]);
    // Priority Columns
    const priorityKeys = ['udise_code', 'school_name', 'district', 'block'];
    
    const generatedCols = keys.map((key) => {
      const label = key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const isNumeric = key.includes('total') || key.includes('count') || key.includes('students') || (!isNaN(flattenedData[0][key]) && String(flattenedData[0][key]).trim() !== '');
      
      // Dynamic Width Calculation based on content and label length
      let width = 180; // Default width
      if (key === 'udise_code') width = 140;
      if (key === 'school_name') width = 280;
      if (isNumeric) width = 140;
      if (key === 'local_id') width = 100;
      
      // Increase width for long labels
      const labelLength = label.length;
      if (labelLength > 20) width = Math.max(width, 200);
      if (labelLength > 30) width = Math.max(width, 240);

      return { key, label, align: isNumeric ? "center" : "left", width };
    });
    
    return generatedCols.sort((a, b) => {
      const aIdx = priorityKeys.indexOf(a.key);
      const bIdx = priorityKeys.indexOf(b.key);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return 0;
    });
  }, [flattenedData]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return flattenedData;
    const term = searchTerm.toLowerCase();
    return flattenedData.filter(row => Object.values(row).some(val => String(val).toLowerCase().includes(term)));
  }, [flattenedData, searchTerm]);

  // Virtualization
  const ROW_HEIGHT = 45;
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
      const handleResize = () => { if(containerRef.current) setContainerHeight(containerRef.current.clientHeight); };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isFullScreen]);

  const totalContentHeight = filteredData.length * ROW_HEIGHT;
  const startIndex = Math.floor(scrollTop / ROW_HEIGHT);
  const endIndex = Math.min(filteredData.length, startIndex + Math.ceil(containerHeight / ROW_HEIGHT) + 10);
  const visibleRows = filteredData.slice(startIndex, endIndex).map((row, i) => ({ ...row, absoluteIndex: startIndex + i, top: (startIndex + i) * ROW_HEIGHT }));

  // Synchronized scroll handler
  const handleScroll = (e) => {
    const { scrollTop, scrollLeft, scrollHeight, clientHeight } = e.currentTarget;
    setScrollTop(scrollTop);
    
    // Sync header horizontal scroll
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = scrollLeft;
    }
    
    // Load more when near bottom
    if (scrollHeight - scrollTop <= clientHeight + 300 && onLoadMore && !isFetching) {
      onLoadMore();
    }
  };

  // Calculate total width for scrollable content
  const totalColumnsWidth = columns.reduce((sum, col) => sum + col.width, 0);

  // --- Export CSV ---
  const exportCSV = () => {
    if (filteredData.length === 0) return;
    const headers = columns.map(c => c.key).join(",");
    const rows = filteredData.map(row => columns.map(c => `"${String(row[c.key] || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([headers + "\n" + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "data_export.csv";
    link.click();
  };

  if (!data || data.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {isFetching ? (
        <div className="flex flex-col items-center animate-pulse">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-500">Retrieving Records...</p>
        </div>
      ) : (
        <div className="text-center text-gray-400"><Database className="w-16 h-16 mx-auto mb-4 opacity-20" /><p>No Data Available</p></div>
      )}
    </div>
  );

  return (
    <div className={`flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${isFullScreen ? 'h-screen' : 'h-full'} overflow-hidden`}>
      {/* Controls Bar */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 justify-between items-center bg-gray-50/50 dark:bg-gray-900/20 flex-shrink-0">
        <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Filter loaded..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 outline-none" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md border border-blue-100 dark:border-blue-800 whitespace-nowrap">
             <Database className="w-4 h-4" /><span className="text-sm font-bold">{totalRecords.toLocaleString("en-IN")}</span><span className="text-xs opacity-70 hidden sm:inline">Records</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="hidden sm:inline">{filteredData.length} Loaded</span>
          {toggleFullScreen && <button onClick={toggleFullScreen} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300">{isFullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}</button>}
          <button onClick={exportCSV} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300"><Download className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Header Row */}
      <div className="border-b border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 flex-shrink-0 overflow-hidden">
        <div className="flex h-12 items-center">
          {/* Sticky Index Header */}
          <div 
            className="flex-shrink-0 flex items-center justify-center border-r border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider sticky left-0 z-20"
            style={{ width: '56px', minWidth: '56px' }}
          >
            #
          </div>
           
          {/* Scrollable Header Container */}
          <div 
            ref={headerScrollRef}
            className="flex-1 overflow-x-hidden overflow-y-hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex" style={{ width: totalColumnsWidth }}>
              {columns.map((col) => (
                <div 
                  key={col.key} 
                  className={`px-3 flex items-center border-r border-gray-300 dark:border-gray-600 last:border-0 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide ${col.align === 'center' ? 'justify-center' : 'justify-start'}`} 
                  style={{ width: col.width, minWidth: col.width, flexShrink: 0 }}
                  title={col.label}
                >
                  <span className="truncate leading-tight">{col.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Body with Virtual Scrolling */}
      <div 
        ref={containerRef} 
        onScroll={handleScroll} 
        className="flex-1 overflow-auto relative bg-white dark:bg-gray-800"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E0 #F7FAFC'
        }}
      >
        <div style={{ height: totalContentHeight, width: totalColumnsWidth + 56, position: "relative" }}>
          {visibleRows.map((row) => (
            <VirtualRow 
              key={row.absoluteIndex} 
              row={row} 
              index={row.absoluteIndex} 
              columns={columns} 
              style={{ top: row.top, height: ROW_HEIGHT }} 
            />
          ))}
        </div>
        
        {/* Loading Indicator */}
        {isFetching && (
          <div className="sticky bottom-0 left-0 w-full p-2 bg-blue-50/90 dark:bg-blue-900/80 backdrop-blur-sm flex justify-center items-center border-t border-blue-100 dark:border-blue-800 z-30">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Streaming data...</span>
          </div>
        )}
      </div>
      
      {/* Footer Stats */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 flex justify-between flex-shrink-0">
         <span>Showing rows {filteredData.length > 0 ? 1 : 0} - {filteredData.length} of {totalRecords.toLocaleString()}</span>
         <span>{((filteredData.length / (totalRecords || 1)) * 100).toFixed(1)}% Loaded</span>
      </div>
    </div>
  );
};

export default DataTable;