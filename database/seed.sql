-- =========================================
-- DADOS INICIAIS DO EMPREGO PERTO DE VOCE
-- =========================================

-- CIDADES
INSERT INTO cidades (nome) VALUES
('Guarabira'),
('Joao Pessoa');

-- BAIRROS
INSERT INTO bairros (cidade_id, nome, latitude, longitude) VALUES
(1, 'Centro', -6.8548, -35.4902),
(1, 'Novo', -6.8500, -35.4850),
(1, 'Juá', -6.8600, -35.4950),
(1, 'Nordeste', -6.8450, -35.4800),
(1, 'Primavera', -6.8650, -35.4850),
(1, 'Cordeiro', -6.8550, -35.4750),
(2, 'Centro', -7.1150, -34.8610),
(2, 'Manaíra', -7.1000, -34.8350),
(2, 'Tambaú', -7.1150, -34.8200),
(2, 'Bancários', -7.1600, -34.8500),
(2, 'Mangabeira', -7.1800, -34.8400),
(2, 'Bessa', -7.0800, -34.8300);

-- USUARIOS
INSERT INTO usuarios (perfil, email, senha_hash, telefone) VALUES
('candidato', 'candidato1@email.com', 'hash_teste_123', '83999990001'),
('candidato', 'candidato2@email.com', 'hash_teste_456', '83999990002'),
('empresa', 'empresa1@email.com', 'hash_teste_789', '83999990003'),
('empresa', 'empresa2@email.com', 'hash_teste_012', '83999990004');

-- CANDIDATOS
INSERT INTO candidatos (
    usuario_id, nome, whatsapp, area_interesse,
    bairro_id, curriculo_path
) VALUES
(1, 'Joao da Silva', '83988880001', 'comercio', 1, NULL),
(2, 'Maria Oliveira', '83988880002', 'alimentacao', 7, NULL);

-- EMPRESAS
INSERT INTO empresas (
    usuario_id, nome, cnpj, descricao,
    setor, site, bairro_id
) VALUES
(
    3,
    'Mercado Guarabirense',
    '11444777000161',
    'Comercio de alimentos e produtos diversos.',
    'comercio',
    'https://mercadoguarabirense.example',
    1
),
(
    4,
    'Restaurante Sabor Paraibano',
    '98765432000198',
    'Restaurante especializado em comida regional.',
    'alimentacao',
    'https://saborparaibano.example',
    7
);

-- VAGAS
INSERT INTO vagas (
    empresa_id, titulo, descricao, requisitos,
    area, contrato, regime, turno, bairro_id, salario
) VALUES
(
    3, 'Atendente de Loja',
    'Atendimento aos clientes e organizacao da loja.',
    'Boa comunicacao e disponibilidade.',
    'comercio', 'clt', 'presencial', 'integral', 1, 1600.00
),
(
    3, 'Operador de Caixa',
    'Operacao de caixa e atendimento ao consumidor.',
    'Atencao e responsabilidade.',
    'comercio', 'clt', 'presencial', 'tarde', 1, 1550.00
),
(
    3, 'Repositor',
    'Reposicao e organizacao de mercadorias.',
    'Organizacao e pontualidade.',
    'comercio', 'meio_periodo', 'presencial', 'manha', 2, 900.00
),
(
    3, 'Auxiliar Administrativo',
    'Apoio nas atividades administrativas.',
    'Conhecimento basico de informatica.',
    'servicos_gerais', 'estagio', 'presencial', 'manha', 1, 1000.00
),
(
    4, 'Auxiliar de Cozinha',
    'Preparacao de alimentos e organizacao da cozinha.',
    'Organizacao e higiene.',
    'alimentacao', 'clt', 'presencial', 'integral', 7, 1600.00
),
(
    4, 'Garcom',
    'Atendimento aos clientes e anotacao de pedidos.',
    'Boa comunicacao e cordialidade.',
    'alimentacao', 'clt', 'presencial', 'noturno', 7, 1500.00
),
(
    4, 'Entregador',
    'Entrega de pedidos na regiao.',
    'Conhecer a regiao e possuir meio de transporte.',
    'servicos_gerais', 'temporario', 'presencial', 'tarde', 8, 1400.00
),
(
    4, 'Auxiliar de Atendimento',
    'Recepcao e atendimento aos clientes.',
    'Boa comunicacao e organizacao.',
    'alimentacao', 'meio_periodo', 'presencial', 'tarde', 9, 850.00
);

-- CANDIDATURAS
INSERT INTO candidaturas (vaga_id, candidato_id, status) VALUES
(1, 1, 'enviada'),
(2, 1, 'em_analise'),
(5, 2, 'enviada'),
(6, 2, 'entrevista');