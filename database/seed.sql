-- =========================================
-- DADOS DE DEMONSTRACAO - EMPREGO PERTO DE VOCE
-- Todos os dados sao ficticios.
-- Senha de todas as contas: Teste@1234
-- =========================================

-- CIDADES
INSERT INTO cidades (nome) VALUES
('Guarabira'),
('Joao Pessoa');

-- BAIRROS
INSERT INTO bairros (cidade_id, nome, latitude, longitude) VALUES
(1, 'Centro', -6.8548, -35.4902),
(1, 'Novo', -6.8500, -35.4850),
(1, 'Jua', -6.8600, -35.4950),
(1, 'Nordeste', -6.8450, -35.4800),
(1, 'Primavera', -6.8650, -35.4850),
(1, 'Cordeiro', -6.8550, -35.4750),
(2, 'Centro', -7.1150, -34.8610),
(2, 'Manaira', -7.1000, -34.8350),
(2, 'Tambau', -7.1150, -34.8200),
(2, 'Bancarios', -7.1600, -34.8500),
(2, 'Mangabeira', -7.1800, -34.8400),
(2, 'Bessa', -7.0800, -34.8300);

-- USUARIOS
-- Senha de todas as contas: Teste@1234
INSERT INTO usuarios (perfil, email, senha_hash, telefone) VALUES
('candidato', 'candidato1@email.com', 'scrypt:32768:8:1$N8P2pMq1LVBZOeQT$db721c9b9c10c1068aa0aa0cb6c5af1a96a4f213ec38a294fbae8b4bd49284b9118a9b8a814d1f43cc039d843f3c2c7acfd19707ac99a85e45a49dd496ec8dd1', '83999990001'),
('candidato', 'candidato2@email.com', 'scrypt:32768:8:1$N8P2pMq1LVBZOeQT$db721c9b9c10c1068aa0aa0cb6c5af1a96a4f213ec38a294fbae8b4bd49284b9118a9b8a814d1f43cc039d843f3c2c7acfd19707ac99a85e45a49dd496ec8dd1', '83999990002'),
('candidato', 'candidato3@email.com', 'scrypt:32768:8:1$N8P2pMq1LVBZOeQT$db721c9b9c10c1068aa0aa0cb6c5af1a96a4f213ec38a294fbae8b4bd49284b9118a9b8a814d1f43cc039d843f3c2c7acfd19707ac99a85e45a49dd496ec8dd1', '83999990003'),
('candidato', 'candidato4@email.com', 'scrypt:32768:8:1$N8P2pMq1LVBZOeQT$db721c9b9c10c1068aa0aa0cb6c5af1a96a4f213ec38a294fbae8b4bd49284b9118a9b8a814d1f43cc039d843f3c2c7acfd19707ac99a85e45a49dd496ec8dd1', '83999990004'),
('candidato', 'candidato5@email.com', 'scrypt:32768:8:1$N8P2pMq1LVBZOeQT$db721c9b9c10c1068aa0aa0cb6c5af1a96a4f213ec38a294fbae8b4bd49284b9118a9b8a814d1f43cc039d843f3c2c7acfd19707ac99a85e45a49dd496ec8dd1', '83999990005'),
('candidato', 'candidato6@email.com', 'scrypt:32768:8:1$N8P2pMq1LVBZOeQT$db721c9b9c10c1068aa0aa0cb6c5af1a96a4f213ec38a294fbae8b4bd49284b9118a9b8a814d1f43cc039d843f3c2c7acfd19707ac99a85e45a49dd496ec8dd1', '83999990006'),
('candidato', 'candidato7@email.com', 'scrypt:32768:8:1$N8P2pMq1LVBZOeQT$db721c9b9c10c1068aa0aa0cb6c5af1a96a4f213ec38a294fbae8b4bd49284b9118a9b8a814d1f43cc039d843f3c2c7acfd19707ac99a85e45a49dd496ec8dd1', '83999990007'),
('candidato', 'candidato8@email.com', 'scrypt:32768:8:1$N8P2pMq1LVBZOeQT$db721c9b9c10c1068aa0aa0cb6c5af1a96a4f213ec38a294fbae8b4bd49284b9118a9b8a814d1f43cc039d843f3c2c7acfd19707ac99a85e45a49dd496ec8dd1', '83999990008'),
('empresa', 'empresa1@email.com', 'scrypt:32768:8:1$N8P2pMq1LVBZOeQT$db721c9b9c10c1068aa0aa0cb6c5af1a96a4f213ec38a294fbae8b4bd49284b9118a9b8a814d1f43cc039d843f3c2c7acfd19707ac99a85e45a49dd496ec8dd1', '83999990009'),
('empresa', 'empresa2@email.com', 'scrypt:32768:8:1$N8P2pMq1LVBZOeQT$db721c9b9c10c1068aa0aa0cb6c5af1a96a4f213ec38a294fbae8b4bd49284b9118a9b8a814d1f43cc039d843f3c2c7acfd19707ac99a85e45a49dd496ec8dd1', '83999990010'),
('empresa', 'empresa3@email.com', 'scrypt:32768:8:1$N8P2pMq1LVBZOeQT$db721c9b9c10c1068aa0aa0cb6c5af1a96a4f213ec38a294fbae8b4bd49284b9118a9b8a814d1f43cc039d843f3c2c7acfd19707ac99a85e45a49dd496ec8dd1', '83999990011'),
('empresa', 'empresa4@email.com', 'scrypt:32768:8:1$N8P2pMq1LVBZOeQT$db721c9b9c10c1068aa0aa0cb6c5af1a96a4f213ec38a294fbae8b4bd49284b9118a9b8a814d1f43cc039d843f3c2c7acfd19707ac99a85e45a49dd496ec8dd1', '83999990012'),
('empresa', 'empresa5@email.com', 'scrypt:32768:8:1$N8P2pMq1LVBZOeQT$db721c9b9c10c1068aa0aa0cb6c5af1a96a4f213ec38a294fbae8b4bd49284b9118a9b8a814d1f43cc039d843f3c2c7acfd19707ac99a85e45a49dd496ec8dd1', '83999990013'),
('empresa', 'empresa6@email.com', 'scrypt:32768:8:1$N8P2pMq1LVBZOeQT$db721c9b9c10c1068aa0aa0cb6c5af1a96a4f213ec38a294fbae8b4bd49284b9118a9b8a814d1f43cc039d843f3c2c7acfd19707ac99a85e45a49dd496ec8dd1', '83999990014');

-- CANDIDATOS
INSERT INTO candidatos (
    usuario_id, nome, whatsapp, area_interesse,
    bairro_id, curriculo_path
) VALUES
(1, 'Joao da Silva', '83988880001', 'comercio', 1, NULL),
(2, 'Maria Oliveira', '83988880002', 'alimentacao', 7, NULL),
(3, 'Pedro Santos', '83988880003', 'saude', 2, NULL),
(4, 'Ana Costa', '83988880004', 'educacao', 8, NULL),
(5, 'Lucas Ferreira', '83988880005', 'servicos_gerais', 3, NULL),
(6, 'Carla Souza', '83988880006', 'comercio', 9, NULL),
(7, 'Marcos Lima', '83988880007', 'alimentacao', 5, NULL),
(8, 'Juliana Alves', '83988880008', 'saude', 11, NULL);

-- EMPRESAS
INSERT INTO empresas (
    usuario_id, nome, cnpj, descricao,
    setor, site, bairro_id
) VALUES
(9, 'Mercado Guarabirense', '12345678000195',
 'Comercio de alimentos e produtos diversos.',
 'comercio', 'https://mercadoguarabirense.example', 1),

(10, 'Restaurante Sabor Paraibano', '23456789000195',
 'Restaurante especializado em comida regional.',
 'alimentacao', 'https://saborparaibano.example', 7),

(11, 'Clinica Vida Saudavel', '34567890000130',
 'Atendimento e servicos de saude.',
 'saude', 'https://vidasaudavel.example', 2),

(12, 'Escola Aprender', '45678901000175',
 'Instituicao de ensino e reforco escolar.',
 'educacao', 'https://escolaaprender.example', 8),

(13, 'Servicos Gerais Nordeste', '56789012000100',
 'Empresa de limpeza e manutencao.',
 'servicos_gerais', 'https://servicosnordeste.example', 4),

(14, 'Comercial Joao Pessoa', '67890123000116',
 'Comercio varejista de produtos diversos.',
 'comercio', 'https://comercialjp.example', 10);

-- 24 vagas: todas as areas, contratos, regimes e turnos.
-- Distribuidas entre os quatro status.
-- Algumas vagas sem salario.

INSERT INTO vagas (
    empresa_id, titulo, descricao, requisitos,
    area, contrato, regime, turno, bairro_id, salario, status
) VALUES
(9, 'Atendente de Loja',
 'Atendimento aos clientes e organizacao da loja.',
 'Boa comunicacao e disponibilidade.',
 'comercio', 'clt', 'presencial', 'integral', 1, 1600.00, 'aberta'),

(9, 'Operador de Caixa',
 'Operacao de caixa e atendimento ao consumidor.',
 'Atencao e responsabilidade.',
 'comercio', 'clt', 'presencial', 'tarde', 2, 1550.00, 'aberta'),

(9, 'Repositor',
 'Reposicao e organizacao de mercadorias.',
 'Organizacao e pontualidade.',
 'comercio', 'meio_periodo', 'presencial', 'manha', 3, 900.00, 'aberta'),

(9, 'Auxiliar Administrativo',
 'Apoio nas atividades administrativas.',
 'Conhecimento basico de informatica.',
 'servicos_gerais', 'estagio', 'hibrido', 'manha', 1, 1000.00, 'aberta'),

(10, 'Auxiliar de Cozinha',
 'Preparacao de alimentos e organizacao da cozinha.',
 'Organizacao e higiene.',
 'alimentacao', 'clt', 'presencial', 'integral', 7, 1600.00, 'pausada'),

(10, 'Garcom',
 'Atendimento aos clientes e anotacao de pedidos.',
 'Boa comunicacao e cordialidade.',
 'alimentacao', 'clt', 'presencial', 'noturno', 8, 1500.00, 'pausada'),

(10, 'Entregador',
 'Entrega de pedidos na regiao.',
 'Conhecer a regiao e possuir meio de transporte.',
 'servicos_gerais', 'temporario', 'presencial', 'tarde', 9, NULL, 'pausada'),

(10, 'Auxiliar de Atendimento',
 'Recepcao e atendimento aos clientes.',
 'Boa comunicacao e organizacao.',
 'alimentacao', 'meio_periodo', 'remoto', 'tarde', 10, 850.00, 'pausada'),

(11, 'Recepcionista',
 'Recepcao e cadastro de pacientes.',
 'Boa comunicacao e organizacao.',
 'saude', 'clt', 'presencial', 'integral', 2, 1800.00, 'encerrada'),

(11, 'Auxiliar de Clinica',
 'Apoio nas atividades da clinica.',
 'Organizacao e responsabilidade.',
 'saude', 'temporario', 'presencial', 'manha', 3, NULL, 'encerrada'),

(11, 'Assistente Administrativo',
 'Organizacao de documentos e atendimento.',
 'Conhecimento em informatica.',
 'servicos_gerais', 'meio_periodo', 'hibrido', 'tarde', 4, 1100.00, 'encerrada'),

(11, 'Estagiario de Atendimento',
 'Apoio no atendimento aos pacientes.',
 'Estar cursando ensino superior.',
 'saude', 'estagio', 'presencial', 'manha', 5, 900.00, 'encerrada'),

(12, 'Auxiliar de Sala',
 'Apoio aos professores em sala de aula.',
 'Boa comunicacao e paciencia.',
 'educacao', 'clt', 'presencial', 'integral', 8, 1700.00, 'cancelada'),

(12, 'Professor de Reforco',
 'Aulas de reforco escolar.',
 'Experiencia com ensino.',
 'educacao', 'temporario', 'remoto', 'tarde', 9, 2000.00, 'cancelada'),

(12, 'Secretario Escolar',
 'Atendimento e organizacao escolar.',
 'Conhecimento basico de informatica.',
 'educacao', 'meio_periodo', 'presencial', 'manha', 10, 1200.00, 'cancelada'),

(12, 'Monitor Escolar',
 'Acompanhamento de atividades escolares.',
 'Responsabilidade e organizacao.',
 'educacao', 'estagio', 'hibrido', 'noturno', 11, NULL, 'cancelada'),

(13, 'Auxiliar de Limpeza',
 'Limpeza e conservacao de ambientes.',
 'Disponibilidade e organizacao.',
 'servicos_gerais', 'clt', 'presencial', 'integral', 4, 1500.00, 'aberta'),

(13, 'Auxiliar de Manutencao',
 'Apoio em manutencao predial.',
 'Conhecimentos basicos de manutencao.',
 'servicos_gerais', 'temporario', 'presencial', 'manha', 5, 1750.00, 'aberta'),

(13, 'Auxiliar de Servicos',
 'Apoio em atividades operacionais.',
 'Organizacao e pontualidade.',
 'servicos_gerais', 'meio_periodo', 'hibrido', 'tarde', 6, NULL, 'pausada'),

(13, 'Assistente de Limpeza',
 'Organizacao e higienizacao de ambientes.',
 'Experiencia sera um diferencial.',
 'servicos_gerais', 'estagio', 'remoto', 'noturno', 1, 950.00, 'encerrada'),

(14, 'Vendedor',
 'Atendimento e vendas de produtos.',
 'Boa comunicacao e dinamismo.',
 'comercio', 'clt', 'presencial', 'integral', 10, 1800.00, 'aberta'),

(14, 'Auxiliar de Estoque',
 'Controle e organizacao do estoque.',
 'Atencao e organizacao.',
 'comercio', 'temporario', 'presencial', 'manha', 11, 1600.00, 'aberta'),

(14, 'Assistente Comercial',
 'Apoio nas atividades comerciais.',
 'Conhecimento em atendimento.',
 'comercio', 'meio_periodo', 'hibrido', 'tarde', 12, NULL, 'cancelada'),

(14, 'Analista de Vendas',
 'Acompanhamento de vendas e clientes.',
 'Experiencia com vendas.',
 'comercio', 'estagio', 'remoto', 'noturno', 7, 1300.00, 'pausada');

-- CANDIDATURAS
-- Contempla os seis status disponiveis.
INSERT INTO candidaturas (vaga_id, candidato_id, status) VALUES
(1, 1, 'enviada'),
(2, 2, 'em_analise'),
(3, 3, 'curriculo_visto'),
(4, 4, 'entrevista'),
(5, 5, 'encerrada'),
(6, 6, 'rejeitada'),
(7, 7, 'enviada'),
(8, 8, 'em_analise'),
(9, 1, 'curriculo_visto'),
(10, 2, 'entrevista'),
(11, 3, 'encerrada'),
(12, 4, 'rejeitada'),
(17, 5, 'enviada'),
(18, 6, 'em_analise'),
(21, 7, 'curriculo_visto'),
(22, 8, 'entrevista');