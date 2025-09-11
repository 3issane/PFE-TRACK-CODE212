const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || "http://localhost:8080";

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const reportsAPI = {
  async getMy() {
    // Placeholder: backend student-specific endpoint not yet implemented.
    // Falls back to list (admin/prof) if available; otherwise returns empty.
    try {
      const res = await fetch(`${API_BASE}/api/reports`, { headers: { ...authHeader() } });
      if (!res.ok) return [];
      return await res.json();
    } catch { return []; }
  },
  async createWithFile(formData) {
    // Backend file upload not yet implemented; placeholder returns ok-like object.
    return { ok: true };
  },
  async downloadFile(id) {
    return fetch(`${API_BASE}/api/reports/${id}/file`, { headers: { ...authHeader() } });
  },
  async getFile(id) {
    return fetch(`${API_BASE}/api/reports/${id}/file`, { headers: { ...authHeader() } });
  },
  async delete(id) {
    return fetch(`${API_BASE}/api/reports/${id}`, { method: 'DELETE', headers: { ...authHeader() } });
  }
};
