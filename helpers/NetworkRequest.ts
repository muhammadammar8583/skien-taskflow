import axios from 'axios'
import ApiConstants from '@/constants/ApiConstants'

const NetworkRequest = axios.create({
  baseURL: ApiConstants.baseUrl,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

export function getNetworkErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message
    return typeof message === 'string' ? message : error.message || fallback
  }

  return error instanceof Error ? error.message : fallback
}

export const getHeaders = (token?: string, other: Record<string, any> = {}, baseURL?: string) => {
  const headers: Record<string, any> = {
    ...other,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config: Record<string, any> = { headers };

  if (baseURL) {
    config.baseURL = baseURL;
  }

  return config;
};

export default NetworkRequest