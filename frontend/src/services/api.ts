import axios from 'axios'

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

let authToken: string | null = null
let unauthorizedHandler: (() => void) | null = null

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function setAuthToken(token: string | null | undefined) {
  authToken = token ?? null
  if (authToken) {
    api.defaults.headers.common.Authorization = `Bearer ${authToken}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export function registerUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401 && unauthorizedHandler) {
        unauthorizedHandler()
      }
      console.error('Error de respuesta:', error.response.data)
    } else if (error.request) {
      console.error('Error de red:', error.request)
    } else {
      console.error('Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default api
