import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown, ArrowUpDown, Filter } from "lucide-react";
import CONFIG from "../../api/config";
import { COLUMN_MAPPING } from "./Column";


const DataTable = ({ data }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = CONFIG?.ITEMS_PER_PAGE || 15;

  // 1. Generate Columns Dynamically from Mapping
  const columns = useMemo(() => {
    const generatedCols = [];
    
    // Iterate through all categories in the mapping (search-schools, profile, etc.)
    Object.values(COLUMN_MAPPING).forEach((group) => {
      // Iterate through keys in each group
      Object.values(group).forEach((fieldKey) => {
        // Create a human-readable label from the snake_case key
        // e.g., "school_name" -> "School Name"
        const label = fieldKey
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        // Simple heuristic to right-align numeric-sounding columns
        const isNumeric = 
          fieldKey.includes('total') || 
          fieldKey.includes('students') || 
          fieldKey.includes('count') ||
          fieldKey.includes('boy') ||
          fieldKey.includes('girl');

        generatedCols.push({
          key: fieldKey,
          label: label,
          align: isNumeric ? "right" : "left"
        });
      });
    });

    // Ensure UDISE Code is first if it exists in the list
    const udiseColIndex = generatedCols.findIndex(c => c.key === 'udise_code');
    if (udiseColIndex > -1) {
      const [udiseCol] = generatedCols.splice(udiseColIndex, 1);
      generatedCols.unshift(udiseCol);
    }

    return generatedCols;
  }, []);

  // 2. Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // 3. Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  useEffect(() => setCurrentPage(1), [data]); // Reset page on new data

  if (data.length === 0) return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
      <Filter className="w-12 h-12 mb-2 opacity-50" />
      <p>No records found. Select different filters.</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300 sticky top-0 z-10 shadow-sm">
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-6 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 whitespace-nowrap ${col.align === 'right' ? 'text-right' : ''}`}
                >
                  <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
                    {col.label}
                    {sortConfig.key === col.key ? (
                      sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.map((row, idx) => (
              <tr key={row.local_id || row.id || idx} className="bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700/50">
                {columns.map((col) => (
                  <td key={`${idx}-${col.key}`} className={`px-6 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 ${col.align === 'right' ? 'text-right font-mono' : ''}`}>
                    {col.key === 'udise_code' ? (
                      <span className="font-medium text-blue-600 dark:text-blue-400">{row[col.key]}</span>
                    ) : row[col.key] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-b-lg">
        <div className="text-xs text-gray-500">
          Page {currentPage} of {totalPages} ({sortedData.length} total)
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"><ChevronsLeft className="w-4 h-4" /></button>
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"><ChevronsRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};
export default DataTable;