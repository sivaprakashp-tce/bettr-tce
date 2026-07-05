const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(endpoint, options = {}) {
  const { body, method = 'GET', isFormData = false, ...rest } = options;

  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
    ...rest,
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    let error;
    try {
      const data = await response.json();
      error = data.error || `Request failed with status ${response.status}`;
    } catch {
      error = `Request failed with status ${response.status}`;
    }
    throw new Error(error);
  }

  return response.json();
}

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, body, isFormData = false) =>
    request(endpoint, { method: 'POST', body, isFormData }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
  delete: (endpoint, body) => request(endpoint, { method: 'DELETE', body }),
};
