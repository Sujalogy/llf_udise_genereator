// using import.meta.env for Vite environment variables
export const CONFIG = {
  API_PROXY: import.meta.env.VITE_API_PROXY || "http://localhost:3000/api/udise",
  API_BACKEND: import.meta.env.VITE_API_BACKEND || "http://localhost:3000/api",
  ITEMS_PER_PAGE: Number(import.meta.env.VITE_ITEMS_PER_PAGE) || 15,
};

// Export default as well to maintain backward compatibility if used elsewhere
export default CONFIG;