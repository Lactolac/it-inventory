import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  verify: () => api.get('/auth/verify')
}

// Inventario API
export const inventarioApi = {
  getAll: (params) => api.get('/inventario', { params }),
  getById: (id) => api.get(`/inventario/${id}`),
  create: (data) => api.post('/inventario', data),
  update: (id, data) => api.put(`/inventario/${id}`, data),
  delete: (id) => api.delete(`/inventario/${id}`),
  getTipos: () => api.get('/inventario/tipos-dispositivo'),
  asignarUsuario: (id, idusuario_asignado) => api.post(`/inventario/${id}/asignar`, { idusuario_asignado }),
  setRevision: (id, data) => api.post(`/inventario/${id}/revision`, data)
}

// Licencias API
export const licenciasApi = {
  getAll: (params) => api.get('/licencias', { params }),
  getById: (id) => api.get(`/licencias/${id}`),
  create: (data) => api.post('/licencias', data),
  update: (id, data) => api.put(`/licencias/${id}`, data),
  delete: (id) => api.delete(`/licencias/${id}`),
  getProximasExpirar: (dias) => api.get('/licencias/proximas-expirar', { params: { dias } })
}

// Usuarios API
export const usuariosApi = {
  getAll: (params) => api.get('/usuarios', { params }),
  getById: (id) => api.get(`/usuarios/${id}`),
  create: (data) => api.post('/usuarios', data),
  update: (id, data) => api.put(`/usuarios/${id}`, data),
  delete: (id) => api.delete(`/usuarios/${id}`),
  asignarInventario: (id, inventarioId) => api.post(`/usuarios/${id}/asignar-inventario`, { inventarioId }),
  asignarLicencia: (id, licenciaId) => api.post(`/usuarios/${id}/asignar-licencia`, { licenciaId }),
  removerInventario: (id) => api.delete(`/usuarios/${id}/remover-inventario`),
  removerLicencia: (id) => api.delete(`/usuarios/${id}/remover-licencia`)
}

// Departamentos API
export const departamentosApi = {
  getAll: (params) => api.get('/departamentos', { params }),
  getById: (id) => api.get(`/departamentos/${id}`),
  create: (data) => api.post('/departamentos', data),
  update: (id, data) => api.put(`/departamentos/${id}`, data),
  delete: (id) => api.delete(`/departamentos/${id}`),
  getPuestos: (id) => api.get(`/departamentos/${id}/puestos`)
}

// Puestos API
export const puestosApi = {
  getAll: (params) => api.get('/puestos', { params }),
  getById: (id) => api.get(`/puestos/${id}`),
  create: (data) => api.post('/puestos', data),
  update: (id, data) => api.put(`/puestos/${id}`, data),
  delete: (id) => api.delete(`/puestos/${id}`)
}

// Paises API
export const paisesApi = {
  getAll: (params) => api.get('/paises', { params }),
  getActive: () => api.get('/paises/active'),
  getById: (id) => api.get(`/paises/${id}`),
  create: (data) => api.post('/paises', data),
  update: (id, data) => api.put(`/paises/${id}`, data),
  delete: (id) => api.delete(`/paises/${id}`)
}

// Centros de Distribución API
export const centrosDistribucionApi = {
  getAll: (params) => api.get('/centros-distribucion', { params }),
  getActive: () => api.get('/centros-distribucion/active'),
  getByPais: (idpais) => api.get(`/centros-distribucion/pais/${idpais}`),
  getById: (id) => api.get(`/centros-distribucion/${id}`),
  create: (data) => api.post('/centros-distribucion', data),
  update: (id, data) => api.put(`/centros-distribucion/${id}`, data),
  delete: (id) => api.delete(`/centros-distribucion/${id}`)
}

export default api
