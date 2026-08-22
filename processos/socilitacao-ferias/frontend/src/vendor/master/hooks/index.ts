/**
 * GENERIC HOOKS - Reusable across all projects
 */

import { useEffect, useState } from 'react'
import { apiClient } from '../services/api'
import type { ApiResponse } from '../types/index'

/**
 * useApi - Generic hook for API calls
 * @param url - API endpoint
 * @param immediate - Execute immediately on mount
 * @returns { data, loading, error, refetch }
 */
export function useApi<T>(url: string, immediate: boolean = true) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    const response = await apiClient.get<T>(url)
    if (response.success && response.data) {
      setData(response.data)
    } else {
      setError(response.error || 'Unknown error')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (immediate) {
      fetchData()
    }
  }, [url, immediate])

  return { data, loading, error, refetch: fetchData }
}

/**
 * useMutation - Hook for POST/PUT/DELETE operations
 * @returns { execute, loading, error, data }
 */
export function useMutation<TData, TPayload>(method: 'post' | 'put' | 'delete') {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<TData | null>(null)

  const execute = async (url: string, payload?: TPayload): Promise<ApiResponse<TData>> => {
    setLoading(true)
    setError(null)
    let response: ApiResponse<TData>

    if (method === 'delete') {
      response = await apiClient.delete<TData>(url)
    } else if (method === 'post') {
      response = await apiClient.post<TData>(url, payload)
    } else {
      response = await apiClient.put<TData>(url, payload)
    }

    if (response.success && response.data) {
      setData(response.data)
    } else {
      setError(response.error || 'Unknown error')
    }
    setLoading(false)
    return response
  }

  return { execute, loading, error, data }
}

/**
 * useLocalStorage - Persist state to localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error)
    }
  }

  return [storedValue, setValue] as const
}

/**
 * useDebounce - Debounce a value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

/**
 * usePrevious - Get previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const [previous, setPrevious] = useState<T | undefined>()

  useEffect(() => {
    setPrevious(value)
  }, [value])

  return previous
}
