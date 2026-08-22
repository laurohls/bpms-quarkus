/**
 * MOTOR CLIENT - Axios dedicado para motor BPMS (porta 81)
 * BaseURL: VITE_MOTOR_URL || VITE_API_URL || http://localhost:81
 * Retorna dados crus (sem wrapper ApiResponse) - espelha ProcessResource/TaskResource
 */

import axios from 'axios'
import type { AxiosInstance } from 'axios'

const MOTOR_BASE_URL =
  import.meta.env.VITE_MOTOR_URL || import.meta.env.VITE_API_URL || 'http://localhost:81'

class MotorClient {
  public client: AxiosInstance

  constructor(baseURL: string = MOTOR_BASE_URL) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('bpms.authToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
  }

  async get<T>(path: string): Promise<T> {
    const { data } = await this.client.get<T>(path)
    return data
  }

  async post<T>(path: string, payload?: unknown): Promise<T> {
    const { data } = await this.client.post<T>(path, payload)
    return data
  }

  // Para /diagram que retorna XML (text)
  async getText(path: string): Promise<string> {
    const { data } = await this.client.get<string>(path, {
      headers: { Accept: 'application/xml' },
      responseType: 'text' as unknown as 'json',
    })
    return data as unknown as string
  }
}

export const motorClient = new MotorClient()
