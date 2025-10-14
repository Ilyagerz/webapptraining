// API client для работы с бэкендом
// Используем относительные пути - они будут проксироваться через Next.js
interface RequestOptions extends RequestInit {
  data?: any;
}

async function request<T>(
  endpoint: string,
  { data, headers: customHeaders, ...customConfig }: RequestOptions = {}
): Promise<T> {
  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...customHeaders,
    },
    ...customConfig,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  // Используем относительный путь - Next.js проксирует на backend
  const response = await fetch(endpoint, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Auth
export const authAPI = {
  loginTelegram: (initData: string) =>
    request('/api/auth/telegram', { data: { initData } }),
  
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  
  getMe: () => request('/api/auth/me'),
};

// Workouts
export const workoutsAPI = {
  getAll: () => request('/api/workouts'),
  
  getById: (id: string) => request(`/api/workouts/${id}`),
  
  create: (workout: any) =>
    request('/api/workouts', { data: workout, method: 'POST' }),
  
  update: (id: string, workout: any) =>
    request(`/api/workouts/${id}`, { data: workout, method: 'PUT' }),
  
  delete: (id: string) =>
    request(`/api/workouts/${id}`, { method: 'DELETE' }),
};

// Templates
export const templatesAPI = {
  getAll: () => request('/api/templates'),
  
  create: (template: any) =>
    request('/api/templates', { data: template, method: 'POST' }),
  
  update: (id: string, template: any) =>
    request(`/api/templates/${id}`, { data: template, method: 'PUT' }),
  
  delete: (id: string) =>
    request(`/api/templates/${id}`, { method: 'DELETE' }),
};

// Measurements
export const measurementsAPI = {
  getAll: () => request('/api/measurements'),
  
  create: (measurement: any) =>
    request('/api/measurements', { data: measurement, method: 'POST' }),
};

// Stats
export const statsAPI = {
  get: () => request('/api/stats'),
};

// User
export const userAPI = {
  updateSettings: (settings: any) =>
    request('/api/user/settings', { data: settings, method: 'PUT' }),
};




