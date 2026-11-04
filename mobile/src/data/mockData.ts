// Dados fictícios de Vagas para testes no aplicativo
export const MOCK_VAGAS = [
  {
    id: '1',
    titulo: 'Desenvolvedor Frontend React Native',
    empresa: 'Tech Soluções',
    localizacao: 'Centro, Guarabira - PB',
    salario: 'R$ 3.500,00',
    descricao: 'Buscamos desenvolvedor com experiência em React Native, Expo e consumo de APIs.',
  },
  {
    id: '2',
    titulo: 'Atendente de Loja',
    empresa: 'Comércio Local',
    localizacao: 'Bairro Novo, Guarabira - PB',
    salario: 'R$ 1.500,00',
    descricao: 'Atendimento ao cliente, organização de produtos e suporte no caixa.',
  },
];

// Dados fictícios de Candidaturas
export const MOCK_CANDIDATURAS = [
  {
    id: 'c1',
    vagaId: '1',
    tituloVaga: 'Desenvolvedor Frontend React Native',
    empresa: 'Tech Soluções',
    status: 'Em análise',
    dataCandidatura: '03/11/2026',
  },
];