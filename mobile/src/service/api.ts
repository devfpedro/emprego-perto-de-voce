export const USE_MOCK = true;

const BASE_URL = 'http://192.168.1.10:3333';

// ATENÇÃO À PALAVRA "export" AQUI:
export const AuthService = {
  async login(email: string, senha: string) {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        data: {
          token: 'mock-jwt-token-123456',
          user: {
            id: '1',
            nome: 'Usuário Teste (Mock)',
            email: email,
            tipo: email.includes('empresa') ? 'empresa' : 'candidato',
          },
        },
      };
    }

    const response = await fetch(`${BASE_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    if (!response.ok) {
      throw new Error('Falha na autenticação');
    }

    const data = await response.json();
    return { data };
  },
};l