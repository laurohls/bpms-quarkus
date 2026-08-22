/**
 * GENERIC API SERVICE
 * Centralized API client for all projects
 */

import axios from 'axios'
import type { AxiosInstance } from 'axios'
import type { ApiResponse, PaginatedResponse } from '../types/index'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

class ApiClient {
  private client: AxiosInstance

  constructor(baseURL: string = API_BASE_URL) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add interceptor for auth token if needed
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('bpms.authToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    try {
      const { data } = await this.client.get<ApiResponse<T>>(path)
      return data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async post<T>(path: string, payload: unknown): Promise<ApiResponse<T>> {
    try {
      const { data } = await this.client.post<ApiResponse<T>>(path, payload)
      return data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async put<T>(path: string, payload: unknown): Promise<ApiResponse<T>> {
    try {
      const { data } = await this.client.put<ApiResponse<T>>(path, payload)
      return data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    try {
      const { data } = await this.client.delete<ApiResponse<T>>(path)
      return data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async getPaginated<T>(path: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<T>> {
    try {
      const { data } = await this.client.get<PaginatedResponse<T>>(`${path}?page=${page}&pageSize=${pageSize}`)
      return data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

export const apiClient = new ApiClient()
