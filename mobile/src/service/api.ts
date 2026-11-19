
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function getAuthHeaders(authenticated = true) {
  const token = authenticated
    ? await AsyncStorage.getItem('@emprego_token')
    : null;

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(
  endpoint: string,
  method: string,
  body?: any,
  authenticated = true
) {
  if (!BASE_URL) {
    throw new Error('A variável EXPO_PUBLIC_API_URL não foi configurada.');
  }

  const headers = await getAuthHeaders(authenticated);

  const response = await fetch(`${BASE_URL.replace(/\/$/, '')}${endpoint}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.erro || `Erro na requisição ${method} para ${endpoint}.`
    );
  }

  return { data, status: response.status };
}

export const ApiService = {
  async get(endpoint: string) {
    return request(endpoint, 'GET');
  },

  async post(endpoint: string, body: any) {
    return request(endpoint, 'POST', body);
  },

  async put(endpoint: string, body: any) {
    return request(endpoint, 'PUT', body);
  },

  async patch(endpoint: string, body: any) {
    return request(endpoint, 'PATCH', body);
  },

  async delete(endpoint: string) {
    return request(endpoint, 'DELETE');
  },
};

export const AuthService = {
  async login(email: string, senha: string) {
    return request('/auth/login', 'POST', { email, senha }, false);
  },
};
