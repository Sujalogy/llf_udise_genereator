// ============================================================================
// --- FILE: src/utils/csvParser.js ---
// ============================================================================

export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split(/\r?\n/);
      
      if (rows.length < 2) {
        reject("File is empty or invalid CSV");
        return;
      }

      // 1. Get Headers "As Is" (Preserving your snake_case naming)
      // e.g. "caste_total_class_1_boy"
      const headers = rows[0].split(',').map(h => {
        let clean = h.trim();
        if (clean.startsWith('"') && clean.endsWith('"')) clean = clean.slice(1, -1);
        return clean;
      });
      
      const data = [];
      for (let i = 1; i < rows.length; i++) {
        const rowText = rows[i].trim();
        if (!rowText) continue;

        // Split by comma, respecting quotes
        const values = rowText.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        
        // Skip malformed rows
        if (values.length !== headers.length) continue; 

        const rowObj = {};
        
        headers.forEach((header, index) => {
          let val = values[index] ? values[index].trim() : "";
          
          // Clean quotes
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          
          // Convert 'NA' or empty strings to null
          if (val === 'NA' || val === '') {
            rowObj[header] = null;
          } else {
            rowObj[header] = val;
          }
        });

        data.push(rowObj);
      }
      
      resolve(data);
    };

    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};