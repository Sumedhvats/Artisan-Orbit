const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('admin_token');
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (let browser set multipart boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

// ── Auth ──
export const authAPI = {
  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  setup: (username, password) =>
    request('/auth/setup', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  me: () => request('/auth/me'),
};

// ── Categories ──
export const categoryAPI = {
  getAll: () => request('/categories'),
  getBySlug: (slug) => request(`/categories/${slug}`),
  create: (data) =>
    request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) =>
    request(`/categories/${id}`, { method: 'DELETE' }),
};

// ── Products ──
export const productAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products?${qs}`);
  },
  getFeatured: () => request('/products/featured'),
  getBySlug: (slug) => request(`/products/${slug}`),
  create: (data) =>
    request('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) =>
    request(`/products/${id}`, { method: 'DELETE' }),
};

// ── Orders ──
export const orderAPI = {
  create: (data) =>
    request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  track: (orderNumber, email) =>
    request(`/orders/track/${orderNumber}?email=${encodeURIComponent(email)}`),
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/orders?${qs}`);
  },
  getById: (id) => request(`/orders/${id}`),
  updateStatus: (id, data) =>
    request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) =>
    request(`/orders/${id}`, { method: 'DELETE' }),
};

// ── Artisanal Requests ──
export const artisanalAPI = {
  create: (data) =>
    request('/artisanal-requests', { method: 'POST', body: JSON.stringify(data) }),
  getAll: () => request('/artisanal-requests'),
  updateStatus: (id, data) =>
    request(`/artisanal-requests/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) =>
    request(`/artisanal-requests/${id}`, { method: 'DELETE' }),
};

// ── Upload ──
export const uploadAPI = {
  productImages: (files) => {
    const fd = new FormData();
    files.forEach((f) => fd.append('images', f));
    return request('/upload/product', { method: 'POST', body: fd });
  },
  customizationPhoto: (file) => {
    const fd = new FormData();
    fd.append('photo', file);
    return request('/upload/customization', { method: 'POST', body: fd });
  },
};

// ── Admin Dashboard ──
export const adminAPI = {
  dashboard: () => request('/admin/dashboard'),
};
