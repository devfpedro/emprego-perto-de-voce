import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.0.2:8000';

async function getAuthHeaders() {
  const token = await AsyncStorage.getItem('@emprego_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const ApiService = {
  async get(endpoint: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição GET para ${endpoint}`);
    }

    const data = await response.json();
    return { data };
  },

  async post(endpoint: string, body: any) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição POST para ${endpoint}`);
    }

    const data = await response.json().catch(() => ({}));
    return { data };
  },

  async put(endpoint: string, body: any) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição PUT para ${endpoint}`);
    }

    const data = await response.json().catch(() => ({}));
    return { data };
  },

  async delete(endpoint: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição DELETE para ${endpoint}`);
    }

    const data = await response.json().catch(() => ({}));
    return { data };
  }
};

export const AuthService = {
  async login(email: string, senha: string) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, senha }),
    });

    if (!response.ok) {
      throw new Error('Credenciais inválidas');
    }

    const data = await response.json();
    return { data };
  }
};