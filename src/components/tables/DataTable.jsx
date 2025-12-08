// ============================================================================
// --- FILE: src/components/tables/DataTable.jsx (FINAL)
// ============================================================================
import React, { useState, useMemo, useEffect } from "react";
import { 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, 
  ArrowUp, ArrowDown, ArrowUpDown, Filter, Download, Search, 
  Maximize, Minimize // ADDED Maximize and Minimize
} from "lucide-react";
import CONFIG from "../../api/config";

// --- UTILITY: Flatten nested objects ---
const flattenObject = (obj, prefix = '') => {
  const flattened = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}_${key}` : key;
      
      // If value is null or undefined, keep it as is
      if (value === null || value === undefined) {
        flattened[newKey] = value;
      }
      // If value is an object (but not an array), flatten it recursively
      else if (typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(flattened, flattenObject(value, newKey));
      }
      // Otherwise, keep the value as is
      else {
        flattened[newKey] = value;
      }
    }
  }
  
  return flattened;
};

// --- OPTIMIZED SUB-COMPONENTS ---

const TableCell = React.memo(({ col, row }) => {
  const cellValue = row[col.key];
  
  // Safely render content
  const renderContent = () => {
    if (cellValue === null || cellValue === undefined) return <span className="text-gray-300">-</span>;
    // If it's still an object/array after flattening, stringify it
    if (typeof cellValue === 'object') return JSON.stringify(cellValue).substring(0, 50) + "..."; 
    return cellValue;
  };

  return (
    <td 
      className={`
        px-4 py-2 whitespace-nowrap text-sm relative transition-colors duration-75 
        border-b border-r border-gray-200 dark:border-gray-700 last:border-r-0
        ${
            // MODIFIED: Center align numeric/numeric-like columns
            col.align === 'center'
              ? 'text-center font-mono text-gray-800 dark:text-gray-200'
              : 'text-gray-700 dark:text-gray-300'
        }
        hover:bg-gray-50 dark:hover:bg-gray-800/50
      `}
    >
      {col.key === 'udise_code' ? (
        <span className="font-medium text-blue-600 dark:text-blue-400 font-mono">{renderContent()}</span>
      ) : (
        <span>
          {renderContent()}
        </span>
      )}
    </td>
  );
});

const TableRow = React.memo(({ row, rowIndex, columns, pageStart }) => {
  return (
    <tr className="bg-white dark:bg-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
      {/* Fixed Row Index Column (Excel-like row header) */}
      <td
        className={`
          px-3 py-2 text-center text-xs font-bold whitespace-nowrap sticky left-0 z-30 
          border-b border-r border-gray-300 dark:border-gray-600 
          bg-gray-100 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 cursor-default
        `}
      >
        {pageStart + rowIndex + 1}
      </td>
      {columns.map((col) => (
        <TableCell 
          key={`${rowIndex}-${col.key}`}
          row={row}
          col={col}
        />
      ))}
    </tr>
  );
});

// --- MAIN COMPONENT ---

const DataTable = ({ data = [], isFullScreen, toggleFullScreen }) => { // ADDED PROPS
  // Flatten the data first
  const flattenedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map(row => flattenObject(row));
  }, [data]);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = CONFIG?.ITEMS_PER_PAGE || 15;

  // 1. Column Logic
  const columns = useMemo(() => {
    if (!flattenedData || flattenedData.length === 0) return [];
    const keys = Object.keys(flattenedData[0]);
    const generatedCols = keys.map((key) => {
      const label = key
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .toLowerCase()
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      
      const isNumeric = key.includes('total') || 
                       key.includes('count') || 
                       key.includes('students') || 
                       // Check if the value is purely numeric string or actual number
                       (!isNaN(flattenedData[0][key]) && String(flattenedData[0][key]).trim() !== '');
      
      return { 
        key, 
        label, 
        // CHANGED: Use 'center' alignment for numeric-like values
        align: isNumeric ? "center" : "left", 
        priority: getColumnPriority(key) 
      };
    });
    return generatedCols.sort((a, b) => a.priority - b.priority);
  }, [flattenedData]);

  function getColumnPriority(key) {
    const k = key.toLowerCase();
    if (k === 'udise_code') return 1;
    if (k === 'school_name') return 2;
    if (k === 'district') return 3;
    return 100;
  }

  // 2. Data Processing
  const filteredData = useMemo(() => {
    if (!searchTerm) return flattenedData;
    const term = searchTerm.toLowerCase();
    return flattenedData.filter(row => 
      Object.values(row).some(val => 
        String(val).toLowerCase().includes(term)
      )
    );
  }, [flattenedData, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortConfig.direction === 'asc' 
        ? String(aVal).localeCompare(String(bVal)) 
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, sortConfig]);

  // 3. Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const pageStart = (currentPage - 1) * itemsPerPage; 
  const paginatedData = useMemo(() => {
    const start = pageStart;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (key) => setSortConfig(c => ({ 
    key, 
    direction: c.key === key && c.direction === 'asc' ? 'desc' : 'asc' 
  }));

  const exportCSV = () => {
    if (sortedData.length === 0) return;
    const headers = columns.map(c => c.key).join(",");
    const rows = sortedData.map(row => 
      columns.map(c => `"${String(row[c.key] || "").replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    const blob = new Blob([headers + "\n" + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "data_export.csv";
    link.click();
  };

  useEffect(() => { 
    setCurrentPage(1); 
  }, [data, searchTerm]);

  if (!data || data.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-gray-500">
      <Filter className="w-12 h-12 mb-3 opacity-20" />
      <p>No data available</p>
    </div>
  );

  return (
    <div className={`flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${isFullScreen ? 'h-screen' : 'h-full'}`}>
      
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
          <span className="text-gray-300">|</span>
          <span>{columns.length} Columns</span>
          
          {/* Fullscreen Button */}
          {toggleFullScreen && (
            <button 
              onClick={toggleFullScreen} 
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-600 dark:text-gray-300"
              title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          )}

          {/* Download Button */}
          <button onClick={exportCSV} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-600 dark:text-gray-300">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div 
        className="flex-1 overflow-auto relative outline-none" 
      >
        <table className="w-full text-sm text-left border-collapse">
          {/* Header */}
          <thead className="text-xs font-bold text-gray-800 dark:text-gray-100 uppercase bg-gray-300 dark:bg-gray-900 sticky top-0 z-20 shadow-md">
            <tr>
              {/* Fixed Row Index Header */}
              <th className="px-3 py-3 font-semibold text-center sticky left-0 z-40 bg-gray-400 dark:bg-gray-700/90 border-r border-b border-gray-400 dark:border-gray-600">
                #
              </th>
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  onClick={() => handleSort(col.key)} 
                  className="px-4 py-3 cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-800 whitespace-nowrap border-b border-r border-gray-400 dark:border-gray-700 last:border-r-0"
                >
                  <div className={`flex items-center gap-1 
                    ${col.align === 'center' ? 'justify-center' : 'justify-start'} // USED CENTER ALIGNMENT
                  `}>
                    {col.label}
                    <span className="text-gray-600 dark:text-gray-400">
                      {sortConfig.key === col.key ? (
                        sortConfig.direction === 'asc' ? 
                          <ArrowUp className="w-3 h-3" /> : 
                          <ArrowDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-30" />
                      )}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <TableRow 
                key={idx}
                row={row}
                rowIndex={idx}
                columns={columns}
                pageStart={pageStart}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
        <div className="text-xs text-gray-500">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => setCurrentPage(1)} 
            disabled={currentPage===1} 
            className="p-1.5 rounded hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30"
          >
            <ChevronsLeft className="w-4 h-4"/>
          </button>
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p-1))} 
            disabled={currentPage===1} 
            className="p-1.5 rounded hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4"/>
          </button>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} 
            disabled={currentPage===totalPages} 
            className="p-1.5 rounded hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4"/>
          </button>
          <button 
            onClick={() => setCurrentPage(totalPages)} 
            disabled={currentPage===totalPages} 
            className="p-1.5 rounded hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30"
          >
            <ChevronsRight className="w-4 h-4"/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;