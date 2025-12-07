// ============================================================================
// --- FILE: src/components/tables/DataTable.jsx ---
// ============================================================================
import { useState, useMemo, useEffect } from "react";
import { 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, 
  ArrowUp, ArrowDown, ArrowUpDown, Filter, Download, Search 
} from "lucide-react";
import CONFIG from "../../api/config";

const DataTable = ({ data = [] }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = CONFIG?.ITEMS_PER_PAGE || 15;

  // 1. Generate Columns Dynamically from Data
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Get all unique keys from the first record
    const keys = Object.keys(data[0]);

    const generatedCols = keys.map((key) => {
      // Create readable label: "caste_total_boy" -> "Caste Total Boy"
      const label = key
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Handle camelCase if present
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Detect numeric columns for alignment
      const isNumeric = 
        key.includes('total') || 
        key.includes('count') || 
        key.includes('students') ||
        typeof data[0][key] === 'number';

      return {
        key: key,
        label: label,
        align: isNumeric ? "right" : "left",
        // Helper for sorting priority
        priority: getColumnPriority(key)
      };
    });

    // Sort columns: IDs/Names first, then Categories, then Metrics
    return generatedCols.sort((a, b) => a.priority - b.priority);
  }, [data]);

  // Helper to order columns logically
  function getColumnPriority(key) {
    const k = key.toLowerCase();
    if (k === 'udise_code') return 1;
    if (k === 'school_name') return 2;
    if (k === 'district') return 3;
    if (k === 'block') return 4;
    if (k === 'school_management') return 5;
    if (k === 'school_category') return 6;
    if (k.includes('total_students')) return 10;
    if (k.startsWith('caste_')) return 20;
    if (k.startsWith('minority_')) return 30;
    if (k.startsWith('age_')) return 40;
    if (k.startsWith('rte_')) return 50;
    return 100; // Everything else
  }

  // 2. Filter & Search
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(row => 
      Object.values(row).some(val => 
        String(val).toLowerCase().includes(term)
      )
    );
  }, [data, searchTerm]);

  // 3. Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === null) return 1;
      if (bVal === null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // 4. Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const exportCSV = () => {
    if (sortedData.length === 0) return;
    const headers = columns.map(c => c.key).join(",");
    const rows = sortedData.map(row => 
      columns.map(c => {
        const val = row[c.key];
        return val === null || val === undefined ? "" : `"${String(val).replace(/"/g, '""')}"`;
      }).join(",")
    ).join("\n");
    
    const blob = new Blob([headers + "\n" + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "table_export.csv";
    link.click();
  };

  useEffect(() => setCurrentPage(1), [data, searchTerm]);

  if (!data || data.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
      <Filter className="w-12 h-12 mb-3 opacity-20 text-gray-500" />
      <p className="text-gray-500">No records found to display.</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>{filteredData.length} Rows</span>
          <button 
            onClick={exportCSV}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-600 dark:text-gray-300"
            title="Export Current View"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto relative custom-scrollbar">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-100 dark:bg-gray-700/50 sticky top-0 z-10 shadow-sm">
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-6 py-3 font-semibold cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 whitespace-nowrap border-b border-gray-200 dark:border-gray-700 ${col.align === 'right' ? 'text-right' : ''}`}
                >
                  <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
                    {col.label}
                    <span className="text-gray-400">
                      {sortConfig.key === col.key ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-500" /> : <ArrowDown className="w-3 h-3 text-blue-500" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-30 transition-opacity" />
                      )}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {paginatedData.map((row, idx) => (
              <tr 
                key={idx} 
                className="bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
              >
                {columns.map((col) => (
                  <td 
                    key={`${idx}-${col.key}`} 
                    className={`px-6 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 ${col.align === 'right' ? 'text-right font-mono' : ''}`}
                  >
                    {col.key === 'udise_code' ? (
                      <span className="font-medium text-blue-600 dark:text-blue-400 font-mono">{row[col.key]}</span>
                    ) : (
                      row[col.key] !== null && row[col.key] !== undefined ? row[col.key] : <span className="text-gray-300">-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-1.5 rounded-md hover:bg-white dark:hover:bg-gray-700 shadow-sm disabled:opacity-30 disabled:shadow-none"><ChevronsLeft className="w-4 h-4" /></button>
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-md hover:bg-white dark:hover:bg-gray-700 shadow-sm disabled:opacity-30 disabled:shadow-none"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-md hover:bg-white dark:hover:bg-gray-700 shadow-sm disabled:opacity-30 disabled:shadow-none"><ChevronRight className="w-4 h-4" /></button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-1.5 rounded-md hover:bg-white dark:hover:bg-gray-700 shadow-sm disabled:opacity-30 disabled:shadow-none"><ChevronsRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};
export default DataTable;