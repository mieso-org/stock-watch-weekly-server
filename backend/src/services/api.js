// src/services/api.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class Api {
  async request(path, opts = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      headers: {'Content-Type':'application/json'},
      ...opts
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  health()    { return this.request('/status'); }
  getPortfolio() { return this.request('/portfolio'); }
  addPosition(data) {
    return this.request('/portfolio', {
      method: 'POST', body: JSON.stringify(data)
    });
  }
  removePosition(id) {
    return this.request(`/portfolio/${id}`, { method: 'DELETE' });
  }
}
export default new Api();
