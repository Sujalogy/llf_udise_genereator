const apiClient = {
  get: async (url, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    try {
      const response = await fetch(fullUrl);
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
        headers: { "Content-Type": "application/json" },
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