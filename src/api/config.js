// using import.meta.env for Vite environment variables
export const CONFIG = {
  API_PROXY: import.meta.env.VITE_API_PROXY || "http://localhost:3000/api/udise",
  API_BACKEND: import.meta.env.VITE_API_BACKEND || "http://localhost:3000/api",
  ITEMS_PER_PAGE: Number(import.meta.env.VITE_ITEMS_PER_PAGE) || 15,
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id-here.apps.googleusercontent.com",
  GOOGLE_REDIRECT_URI: import.meta.env.VITE_GOOGLE_REDIRECT_URI || "http://localhost:5173/auth/callback",
  ALLOWED_OAUTH_DOMAIN: import.meta.env.VITE_ALLOWED_OAUTH_DOMAIN || "",
};

// Export default as well to maintain backward compatibility if used elsewhere
export default CONFIG;