// ============================================================================
// --- FILE: src/components/tables/DataTable.jsx ---
// ============================================================================
import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, 
  ArrowUp, ArrowDown, ArrowUpDown, Filter, Download, Search 
} from "lucide-react";
import CONFIG from "../../api/config";

// --- OPTIMIZED SUB-COMPONENTS ---

const TableCell = React.memo(({ col, row, isSelected, onClick, rowIndex }) => {
  const cellValue = row[col.key];
  
  // FIX: Safely render content to prevent React object crash
  const renderContent = () => {
    if (cellValue === null || cellValue === undefined) return <span className="text-gray-300">-</span>;
    // If it's an object/array, stringify it so React can render it
    if (typeof cellValue === 'object') return JSON.stringify(cellValue).substring(0, 50) + "..."; 
    return cellValue;
  };

  return (
    <td 
      data-row={rowIndex}
      data-col={col.key}
      onClick={() => onClick(col.key)}
      className={`
        px-6 py-3 whitespace-nowrap text-sm cursor-cell relative transition-colors duration-75 border-b border-gray-100 dark:border-gray-700
        ${col.align === 'right' ? 'text-right font-mono' : 'text-gray-700 dark:text-gray-300'}
        ${isSelected 
          ? 'bg-blue-600 text-white dark:bg-blue-500 z-10 ring-2 ring-blue-600 dark:ring-blue-400' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
      `}
    >
      {col.key === 'udise_code' && !isSelected ? (
        <span className="font-medium text-blue-600 dark:text-blue-400 font-mono">{renderContent()}</span>
      ) : (
        <span className={isSelected ? "text-white font-medium" : ""}>
          {renderContent()}
        </span>
      )}
    </td>
  );
});

const TableRow = React.memo(({ row, rowIndex, columns, selectedColKey, onCellClick }) => {
  return (
    <tr className="bg-white dark:bg-gray-800 transition-colors">
      {columns.map((col) => (
        <TableCell 
          key={`${rowIndex}-${col.key}`}
          row={row}
          col={col}
          rowIndex={rowIndex}
          isSelected={selectedColKey === col.key}
          onClick={onCellClick}
        />
      ))}
    </tr>
  );
});

// --- MAIN COMPONENT ---

const DataTable = ({ data = [] }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = CONFIG?.ITEMS_PER_PAGE || 15;

  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
  const tableContainerRef = useRef(null);

  // 1. Column Logic
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    const keys = Object.keys(data[0]);
    const generatedCols = keys.map((key) => {
      const label = key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
        .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const isNumeric = key.includes('total') || key.includes('count') || key.includes('students') || typeof data[0][key] === 'number';
      return { key, label, align: isNumeric ? "right" : "left", priority: getColumnPriority(key) };
    });
    return generatedCols.sort((a, b) => a.priority - b.priority);
  }, [data]);

  function getColumnPriority(key) {
    const k = key.toLowerCase();
    if (k === 'udise_code') return 1;
    if (k === 'school_name') return 2;
    if (k === 'district') return 3;
    return 100;
  }

  // 2. Data Processing
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(row => Object.values(row).some(val => String(val).toLowerCase().includes(term)));
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (typeof aVal === 'number' && typeof bVal === 'number') return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      return sortConfig.direction === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, sortConfig]);

  // 3. Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (key) => setSortConfig(c => ({ key, direction: c.key === key && c.direction === 'asc' ? 'desc' : 'asc' }));

  const exportCSV = () => {
    if (sortedData.length === 0) return;
    const headers = columns.map(c => c.key).join(",");
    const rows = sortedData.map(row => columns.map(c => `"${String(row[c.key] || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([headers + "\n" + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "data_export.csv";
    link.click();
  };

  // --- KEYBOARD NAVIGATION ---
  const handleCellClick = useCallback((rowIndex, colKey) => {
    setSelectedCell({ row: rowIndex, col: colKey });
    tableContainerRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (selectedCell.row === null || selectedCell.col === null) return;
    
    const { row, col } = selectedCell;
    const colIndex = columns.findIndex(c => c.key === col);
    
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();

    let nextRow = row;
    let nextColIndex = colIndex;

    if (e.key === 'ArrowUp') nextRow = Math.max(0, row - 1);
    else if (e.key === 'ArrowDown') nextRow = Math.min(paginatedData.length - 1, row + 1);
    else if (e.key === 'ArrowLeft') nextColIndex = Math.max(0, colIndex - 1);
    else if (e.key === 'ArrowRight') nextColIndex = Math.min(columns.length - 1, colIndex + 1);

    if (nextRow !== row || nextColIndex !== colIndex) {
      setSelectedCell({ row: nextRow, col: columns[nextColIndex].key });
    }
  };

  // --- SCROLL SYNC ---
  useEffect(() => {
    if (selectedCell.row !== null && tableContainerRef.current) {
      const el = tableContainerRef.current.querySelector(`[data-row="${selectedCell.row}"][data-col="${selectedCell.col}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [selectedCell]);

  useEffect(() => { setCurrentPage(1); setSelectedCell({ row: null, col: null }); }, [data, searchTerm]);

  if (!data || data.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-gray-500"><Filter className="w-12 h-12 mb-3 opacity-20" /><p>No data available</p></div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>{filteredData.length} Rows</span>
          <button onClick={exportCSV} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-600 dark:text-gray-300"><Download className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Table Area */}
      <div 
        className="flex-1 overflow-auto relative no-scrollbar outline-none" 
        tabIndex={0} 
        onKeyDown={handleKeyDown}
        ref={tableContainerRef}
      >
        <table className="w-full text-sm text-left border-collapse">
          {/* Header - Darker Opaque Background */}
          <thead className="text-xs font-bold text-gray-800 dark:text-gray-100 uppercase bg-gray-300 dark:bg-gray-900 sticky top-0 z-20 shadow-md">
            <tr>
              {columns.map((col) => (
                <th key={col.key} onClick={() => handleSort(col.key)} className="px-6 py-3 cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-800 whitespace-nowrap">
                  <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
                    {col.label}
                    <span className="text-gray-600 dark:text-gray-400">
                      {sortConfig.key === col.key ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-30" />}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {paginatedData.map((row, idx) => (
              <TableRow 
                key={idx}
                row={row}
                rowIndex={idx}
                columns={columns}
                selectedColKey={selectedCell.row === idx ? selectedCell.col : null}
                onCellClick={(colKey) => handleCellClick(idx, colKey)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
        <div className="text-xs text-gray-500">Page {currentPage} of {totalPages}</div>
        <div className="flex gap-1">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage===1} className="p-1.5 rounded hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30"><ChevronsLeft className="w-4 h-4"/></button>
          <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1} className="p-1.5 rounded hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30"><ChevronLeft className="w-4 h-4"/></button>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages} className="p-1.5 rounded hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30"><ChevronRight className="w-4 h-4"/></button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage===totalPages} className="p-1.5 rounded hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30"><ChevronsRight className="w-4 h-4"/></button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;