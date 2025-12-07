// Format numbers to Indian locale (e.g., 1,00,000)
export const formatNumber = (num) => {
  if (num === null || num === undefined) return "-";
  return new Intl.NumberFormat('en-IN').format(num);
};

// Capitalize first letter of a string
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Generate a unique key for caching data based on state and selected districts
export const generateCacheKey = (state, districts) => {
  if (!state) return "";
  // Sort districts to ensure 'District A, District B' generates same key as 'District B, District A'
  const sortedDistricts = [...districts].sort().join('-');
  return `${state}_${sortedDistricts}`;
};

// Truncate long text
export const truncateText = (text, maxLength = 20) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};