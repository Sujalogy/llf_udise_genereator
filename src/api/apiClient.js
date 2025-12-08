// In src/api/apiClient.js
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const apiClient = {
  get: async (url, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    try {
      const response = await fetch(fullUrl, {
        headers: getAuthHeaders(), // ADDED AUTH HEADERS HERE
      });
      if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("GET Error:", error);
      throw error;
    }
  },
  post: async (url, body) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeaders(), // ADDED AUTH HEADERS HERE
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("POST Error:", error);
      throw error;
    }
  },
};
export default apiClient;