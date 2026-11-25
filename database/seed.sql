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
('candidato', 'candidato1@email.com', 'scrypt:32768:8:1$CsKiXWXvDTLJmNQy$d643d8f1d40db554567b916e5ed0fe00d455b0781eecffe3d622428b9cabc837ec198ca5b6f5499b340734f4fdde4059be32dcfa6b114171cfc58521573c215a', '83999990001'),
('candidato', 'candidato2@email.com', 'scrypt:32768:8:1$OH8oYdzhWvzM9brW$14d7bf6f27b08f46fa53ff63aa3cf4385461c353ca123ceb255cf2fa411d6cf7f933e41de63aff33f8bdd16e0aa288bb1cf7d528a626f0359ff12f42240324c4', '83999990002'),
('candidato', 'candidato3@email.com', 'scrypt:32768:8:1$jYjrMiZTaOeEMfsd$15cc9b6da74962d887c7435a4a6351c79c9191c05aca5dd9197819980b6bf967999dc72c3acfd1a2d82e6cd869c45b3a46df699abd052cd68e595ddacbb8094a', '83999990003'),
('candidato', 'candidato4@email.com', 'scrypt:32768:8:1$smDZ4c3Yh16YTS4e$7ada10221a6c31dd0de015e9e9b51514d6cc47480f28b01de984bc1683a1ff4c1dc719f8304d2d84d518342a0fadf4812ac5feedfab43bcf3b0dd37c8eb6209f', '83999990004'),
('candidato', 'candidato5@email.com', 'scrypt:32768:8:1$V3cLREGT2So1y5Q7$22eccd9c79d48a58097646308b62c1a55eda6ddd3d1e14a80a7914758582abab51dbc7c51b67f67ad1adf9b49d0b5455c454e19af55674328823d155382658e3', '83999990005'),
('candidato', 'candidato6@email.com', 'scrypt:32768:8:1$TbfFI4g15AkEYOIM$61524a0d31cd8e59751b517ae7ef4f7084f451187e24115a062fd1b3af35c616d09fecb3e2e3cebfffc8746a6a415b8602af3589f7309eafe7d3aa4c5f834efe', '83999990006'),
('candidato', 'candidato7@email.com', 'scrypt:32768:8:1$TmpmL3oyWc7sxbrf$6bc910b538655de0c1ebdd49839707ed8cf48982a397352e7469c90c1067e40cab34348d23090ff0f551be21e82be1d2c4054e02158529b146ca9a56bd3cfae5', '83999990007'),
('candidato', 'candidato8@email.com', 'scrypt:32768:8:1$Jnrak8CZazAawkYQ$69c86380b9f97ea6772f915ac5aa3f7500397e941b834b2eed8755cd81013d2df10617a7cc618ca10e483d8d9d683edbcb0f902fdcb5e3428574b9d754b1c19e', '83999990008'),
('empresa', 'empresa1@email.com', 'scrypt:32768:8:1$a9HzzB10eH5dAm92$d5ff434db5e1c0722bbbb18f40c34885af1c786b0925a73fcdf2de78e99dae247cae1de1c04a5c718131e9c3e6278f23a9103b7a4bf9dff9e6f8400e4268913d', '83999990009'),
('empresa', 'empresa2@email.com', 'scrypt:32768:8:1$cVMf1xtmvRP1CdrO$cff833ac84f67f1a771355750648332cca9248a1a8c802d25039a78828d240bd2336be480e96b158c524efd8702403f07dbf7f8da529dfc0908e4f5392c7b61b', '83999990010'),
('empresa', 'empresa3@email.com', 'scrypt:32768:8:1$Neau9v1zFzrZNiDO$4d6e6459c719429f45f72e461d3d4cb298f8daf6b2992094340ef0d9ee0f143b32dd852e1af276582dc12f9a38f773ff11edec6aa5a56d21c9882248c396a80e', '83999990011'),
('empresa', 'empresa4@email.com', 'scrypt:32768:8:1$MVjFFm5KeDQg4sYl$d020c6e4b472aa5e6009d4c4ffef91921822fe0dd3c86016698f256e1ef93e70f208e6c1950a27bd56c0fb05b763ed16aec9e34801844223ea122af5d5f0c1d7', '83999990012'),
('empresa', 'empresa5@email.com', 'scrypt:32768:8:1$H2VUekXUeRH9jMHN$9aba4544a2552758561352b1310691f8b35734da64b6af65d5ddc1e3aa842a8ec9c10a41217481cd252d6a10f8ce9a9df079f0fd1a1c04927a67567d6fa2e09d', '83999990013'),
('empresa', 'empresa6@email.com', 'scrypt:32768:8:1$u3srjhT1WmBYFpmI$83ccf2dad8e0e49572a798ef59f248604d7778df3cc044685ab2cdc93509d1d969ff9268709725e961d99e49f7d100a53075f4252974f38deb67bcf1629b9336', '83999990014');

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