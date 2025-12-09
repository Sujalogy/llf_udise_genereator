// using import.meta.env for Vite environment variables
export const CONFIG = {
  API_PROXY: import.meta.env.VITE_API_PROXY,
  API_BACKEND: import.meta.env.VITE_API_BACKEND,
  ITEMS_PER_PAGE: Number(import.meta.env.VITE_ITEMS_PER_PAGE),
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  GOOGLE_REDIRECT_URI: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
  ALLOWED_OAUTH_DOMAIN: import.meta.env.VITE_ALLOWED_OAUTH_DOMAIN,
};

// Export default as well to maintain backward compatibility if used elsewhere
export default CONFIG;