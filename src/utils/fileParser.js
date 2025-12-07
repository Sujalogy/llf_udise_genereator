// ============================================================================
// --- FILE: src/utils/fileParser.js ---
// ============================================================================
import * as XLSX from 'xlsx';

/**
 * Normalizes a header string to find a match for 'udise_code'
 * e.g., "UDISE_CODE" -> "udisecode", "School Udise Code" -> "schooludisecode"
 */
const normalizeHeader = (header) => {
  if (!header) return "";
  return String(header).toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Finds the key in a row object that corresponds to UDISE Code
 */
const findUdiseKey = (row) => {
  const keys = Object.keys(row);
  
  // 1. Direct strict match candidates
  const candidates = ['udise_code', 'udisecode', 'school_udise_code', 'udise_col_code', 'udise_sch_code', 'ac_year_code', 'schoolcode'];
  
  // Search for exact matches first
  for (const key of keys) {
    const normalized = normalizeHeader(key);
    if (candidates.includes(normalized)) return key;
  }

  // 2. Fuzzy match: contains "udise" AND "code"
  for (const key of keys) {
    const normalized = normalizeHeader(key);
    if (normalized.includes('udise') && normalized.includes('code')) return key;
  }

  return null;
};

/**
 * Extracts ONLY the UDISE Code from the raw data
 */
const processData = (rawData) => {
  if (!rawData || rawData.length === 0) return [];

  // Find the column name that holds the UDISE code in the first row
  const udiseKey = findUdiseKey(rawData[0]);

  if (!udiseKey) {
    throw new Error("Could not find a 'UDISE Code' column. Please ensure the file has a header like 'UDISE_CODE'.");
  }

  // Extract only valid codes
  const codes = rawData
    .map(row => row[udiseKey])
    .filter(val => val !== undefined && val !== null && String(val).trim() !== '') // Remove empty
    .map(val => String(val).trim()); // Ensure string format

  // Deduplicate
  const uniqueCodes = [...new Set(codes)];

  // Return formatted array
  return uniqueCodes.map(code => ({ udise_code: code }));
};

export const parseFile = (file) => {
  return new Promise((resolve, reject) => {
    const fileName = file.name.toLowerCase();
    
    // --- JSON PARSER ---
    if (fileName.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          const data = Array.isArray(json) ? json : [json];
          resolve(processData(data));
        } catch (err) {
          reject("Invalid JSON file");
        }
      };
      reader.onerror = () => reject("Failed to read file");
      reader.readAsText(file);
      return;
    }

    // --- UNIVERSAL SPREADSHEET PARSER (XLSX, CSV, TSV, ODS) ---
    const supportedExts = ['csv', 'xls', 'xlsx', 'xlsm', 'xlsb', 'tsv', 'txt', 'ods'];
    const fileExt = fileName.split('.').pop();

    if (supportedExts.includes(fileExt)) {
      const reader = new FileReader();
      
      // IMPORTANT: Use ArrayBuffer for robustness with Excel binary formats
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'array' }); 
          
          if (workbook.SheetNames.length === 0) throw new Error("File is empty");

          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          
          // SheetJS auto-detects delimiters for CSV/TSV/TXT
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
          resolve(processData(jsonData));
        } catch (err) {
          console.error("Parse Error:", err);
          reject("Failed to parse file. Ensure it is a valid spreadsheet or CSV.");
        }
      };
      
      reader.onerror = () => reject("Failed to read file");
      reader.readAsArrayBuffer(file);
      return;
    }

    reject("Unsupported file type. Please upload CSV, Excel, TSV, or JSON.");
  });
};