BEGIN;
-- =========================================
-- SEED: LOCALIDADES
-- Coordenadas aproximadas para testes
-- =========================================

INSERT INTO localidades (cidade, bairro, latitude, longitude)
VALUES
    -- Guarabira - PB
    ('Guarabira', 'Centro',       -6.8540000, -35.4900000),
    ('Guarabira', 'Nordeste I',   -6.8500000, -35.4870000),
    ('Guarabira', 'Nordeste II',  -6.8470000, -35.4840000),
    ('Guarabira', 'Cordeiro',     -6.8600000, -35.4930000),
    ('Guarabira', 'Juá',          -6.8640000, -35.4870000),

    -- Araçagi - PB
    ('Araçagi', 'Centro',         -6.8430000, -35.3740000),
    ('Araçagi', 'Bela Vista',     -6.8400000, -35.3700000),
    ('Araçagi', 'Santo Amaro',    -6.8470000, -35.3780000),

    -- Pilõezinhos - PB
    ('Pilõezinhos', 'Centro',     -6.8420000, -35.5290000),
    ('Pilõezinhos', 'Rua Nova',   -6.8390000, -35.5260000);



-- =========================================
-- SEED: USUARIOS
-- 10 candidatos e 10 empresas
-- =========================================

INSERT INTO usuarios (nome, email, senha_hash, tipo)
VALUES
    -- Usuários candidatos
    ('Ana Silva', 'ana@email.com', 'hash_teste_ana', 'candidato'),
    ('Carlos Souza', 'carlos@email.com', 'hash_teste_carlos', 'candidato'),
    ('Mariana Costa', 'mariana@email.com', 'hash_teste_mariana', 'candidato'),
    ('Pedro Santos', 'pedro@email.com', 'hash_teste_pedro', 'candidato'),
    ('Lucas Oliveira', 'lucas@email.com', 'hash_teste_lucas', 'candidato'),
    ('Julia Ferreira', 'julia@email.com', 'hash_teste_julia', 'candidato'),
    ('Rafael Lima', 'rafael@email.com', 'hash_teste_rafael', 'candidato'),
    ('Beatriz Alves', 'beatriz@email.com', 'hash_teste_beatriz', 'candidato'),
    ('Gabriel Martins', 'gabriel@email.com', 'hash_teste_gabriel', 'candidato'),
    ('Camila Rocha', 'camila@email.com', 'hash_teste_camila', 'candidato'),

    -- Usuários empresas
    ('Mercado Central', 'mercadocentral@email.com', 'hash_teste_mercado', 'empresa'),
    ('Padaria Pao Bom', 'paobom@email.com', 'hash_teste_paobom', 'empresa'),
    ('Farmacia Popular', 'farmacia@email.com', 'hash_teste_farmacia', 'empresa'),
    ('Loja Estilo', 'estilo@email.com', 'hash_teste_estilo', 'empresa'),
    ('Restaurante Sabor', 'sabor@email.com', 'hash_teste_sabor', 'empresa'),
    ('Oficina do Carro', 'oficina@email.com', 'hash_teste_oficina', 'empresa'),
    ('Clinica Vida', 'clinicavida@email.com', 'hash_teste_clinica', 'empresa'),
    ('Supermercado Bom Preco', 'bompreco@email.com', 'hash_teste_bompreco', 'empresa'),
    ('Papelaria Escolar', 'papelaria@email.com', 'hash_teste_papelaria', 'empresa'),
    ('Academia Forca Total', 'academia@email.com', 'hash_teste_academia', 'empresa');

    -- =========================================
-- SEED: CANDIDATOS
-- =========================================


INSERT INTO candidatos (
    usuario_id,
    cidade,
    bairro,
    area_interesse,
    resumo_profissional
)
SELECT
    u.id,
    dados.cidade,
    dados.bairro,
    dados.area_interesse,
    dados.resumo_profissional
FROM (
    VALUES
        ('ana@email.com', 'Guarabira', 'Centro', 'Tecnologia',
         'Interesse em desenvolvimento de sistemas.'),

        ('carlos@email.com', 'Guarabira', 'Cordeiro', 'Comércio',
         'Experiência com atendimento ao público.'),

        ('mariana@email.com', 'Guarabira', 'Nordeste I', 'Administração',
         'Interesse em rotinas administrativas.'),

        ('pedro@email.com', 'Araçagi', 'Centro', 'Logística',
         'Conhecimentos básicos em estoque e organização.'),

        ('lucas@email.com', 'Guarabira', 'Juá', 'Tecnologia',
         'Interesse em suporte técnico.'),

        ('julia@email.com', 'Araçagi', 'Bela Vista', 'Vendas',
         'Boa comunicação e interesse em vendas.'),

        ('rafael@email.com', 'Pilõezinhos', 'Centro', 'Mecânica',
         'Interesse em manutenção automotiva.'),

        ('beatriz@email.com', 'Guarabira', 'Nordeste II', 'Saúde',
         'Interesse em oportunidades na área da saúde.'),

        ('gabriel@email.com', 'Araçagi', 'Santo Amaro', 'Educação',
         'Interesse em atividades educacionais.'),

        ('camila@email.com', 'Pilõezinhos', 'Rua Nova', 'Atendimento',
         'Experiência fictícia em atendimento ao cliente.')
) AS dados (
    email,
    cidade,
    bairro,
    area_interesse,
    resumo_profissional
)
INNER JOIN usuarios u
    ON u.email = dados.email;

 -- =========================================
-- SEED: EMPRESAS
-- =========================================

INSERT INTO empresas (
    usuario_id,
    nome_fantasia,
    descricao,
    cidade,
    bairro,
    latitude,
    longitude
)
SELECT
    u.id,
    dados.nome_fantasia,
    dados.descricao,
    dados.cidade,
    dados.bairro,
    dados.latitude,
    dados.longitude
FROM (
    VALUES
        ('mercadocentral@email.com', 'Mercado Central',
         'Mercado de produtos alimentícios.',
         'Guarabira', 'Centro', -6.8541000, -35.4901000),

        ('paobom@email.com', 'Padaria Pao Bom',
         'Padaria e confeitaria.',
         'Guarabira', 'Cordeiro', -6.8601000, -35.4931000),

        ('farmacia@email.com', 'Farmacia Popular',
         'Comércio de medicamentos e produtos de saúde.',
         'Guarabira', 'Nordeste I', -6.8501000, -35.4871000),

        ('estilo@email.com', 'Loja Estilo',
         'Loja de roupas e acessórios.',
         'Guarabira', 'Juá', -6.8641000, -35.4871000),

        ('sabor@email.com', 'Restaurante Sabor',
         'Restaurante de refeições variadas.',
         'Araçagi', 'Centro', -6.8431000, -35.3741000),

        ('oficina@email.com', 'Oficina do Carro',
         'Serviços de manutenção automotiva.',
         'Araçagi', 'Bela Vista', -6.8401000, -35.3701000),

        ('clinicavida@email.com', 'Clinica Vida',
         'Clínica de atendimento médico.',
         'Guarabira', 'Nordeste II', -6.8471000, -35.4841000),

        ('bompreco@email.com', 'Supermercado Bom Preco',
         'Supermercado de produtos variados.',
         'Pilõezinhos', 'Centro', -6.8421000, -35.5291000),

        ('papelaria@email.com', 'Papelaria Escolar',
         'Comércio de materiais escolares.',
         'Pilõezinhos', 'Rua Nova', -6.8391000, -35.5261000),

        ('academia@email.com', 'Academia Forca Total',
         'Academia de atividades físicas.',
         'Araçagi', 'Santo Amaro', -6.8471000, -35.3781000)
) AS dados (
    email,
    nome_fantasia,
    descricao,
    cidade,
    bairro,
    latitude,
    longitude
)
INNER JOIN usuarios u
    ON u.email = dados.email;
     -- =========================================
-- SEED: VAGAS
-- 3 vagas para cada uma das 10 empresas
-- =========================================

INSERT INTO vagas (
    empresa_id,
    titulo,
    descricao,
    requisitos,
    area,
    cidade,
    bairro,
    latitude,
    longitude,
    tipo_contrato,
    status
)
SELECT
    e.id,
    dados.titulo,
    dados.descricao,
    dados.requisitos,
    dados.area,
    e.cidade,
    e.bairro,
    e.latitude,
    e.longitude,
    dados.tipo_contrato,
    dados.status
FROM (
    VALUES
        -- Mercado Central
        ('Mercado Central', 'Operador de Caixa',
         'Atendimento aos clientes e registro de compras.',
         'Boa comunicação e atenção.',
         'Comércio', 'CLT', 'aberta'),

        ('Mercado Central', 'Repositor de Mercadorias',
         'Organização e reposição de produtos nas prateleiras.',
         'Organização e responsabilidade.',
         'Comércio', 'CLT', 'aberta'),

        ('Mercado Central', 'Auxiliar de Estoque',
         'Controle e organização de mercadorias.',
         'Conhecimentos básicos de estoque.',
         'Logística', 'CLT', 'pausada'),

        -- Padaria Pao Bom
        ('Padaria Pao Bom', 'Atendente de Padaria',
         'Atendimento ao público e organização do balcão.',
         'Boa comunicação.',
         'Atendimento', 'CLT', 'aberta'),

        ('Padaria Pao Bom', 'Auxiliar de Padeiro',
         'Auxílio na preparação de pães e massas.',
         'Disposição para aprender.',
         'Alimentação', 'CLT', 'aberta'),

        ('Padaria Pao Bom', 'Auxiliar de Limpeza',
         'Limpeza e organização do estabelecimento.',
         'Responsabilidade e organização.',
         'Serviços Gerais', 'CLT', 'encerrada'),

        -- Farmacia Popular
        ('Farmacia Popular', 'Atendente de Farmácia',
         'Atendimento e orientação inicial aos clientes.',
         'Boa comunicação.',
         'Saúde', 'CLT', 'aberta'),

        ('Farmacia Popular', 'Auxiliar Administrativo',
         'Organização de documentos e registros.',
         'Conhecimentos básicos de informática.',
         'Administração', 'CLT', 'aberta'),

        ('Farmacia Popular', 'Operador de Caixa',
         'Registro de vendas e atendimento.',
         'Atenção e responsabilidade.',
         'Comércio', 'CLT', 'aberta'),

        -- Loja Estilo
        ('Loja Estilo', 'Vendedor',
         'Atendimento e venda de roupas e acessórios.',
         'Boa comunicação e interesse em vendas.',
         'Vendas', 'CLT', 'aberta'),

        ('Loja Estilo', 'Auxiliar de Loja',
         'Organização de produtos e atendimento.',
         'Organização e responsabilidade.',
         'Comércio', 'CLT', 'aberta'),

        ('Loja Estilo', 'Estoquista',
         'Recebimento e controle de mercadorias.',
         'Conhecimentos básicos de estoque.',
         'Logística', 'CLT', 'pausada'),

        -- Restaurante Sabor
        ('Restaurante Sabor', 'Garçom',
         'Atendimento aos clientes e entrega de pedidos.',
         'Boa comunicação.',
         'Alimentação', 'CLT', 'aberta'),

        ('Restaurante Sabor', 'Auxiliar de Cozinha',
         'Auxílio no preparo de refeições.',
         'Organização e higiene.',
         'Alimentação', 'CLT', 'aberta'),

        ('Restaurante Sabor', 'Entregador',
         'Entrega de pedidos aos clientes.',
         'Conhecimento da região e habilitação.',
         'Logística', 'Autônomo', 'aberta'),

        -- Oficina do Carro
        ('Oficina do Carro', 'Mecânico Auxiliar',
         'Auxílio em serviços de manutenção automotiva.',
         'Interesse em mecânica.',
         'Mecânica', 'CLT', 'aberta'),

        ('Oficina do Carro', 'Recepcionista',
         'Atendimento e cadastro de clientes.',
         'Boa comunicação e informática básica.',
         'Atendimento', 'CLT', 'aberta'),

        ('Oficina do Carro', 'Auxiliar de Estoque',
         'Controle de peças e materiais.',
         'Organização e atenção.',
         'Logística', 'CLT', 'encerrada'),

        -- Clinica Vida
        ('Clinica Vida', 'Recepcionista',
         'Recepção e agendamento de consultas.',
         'Boa comunicação e informática básica.',
         'Saúde', 'CLT', 'aberta'),

        ('Clinica Vida', 'Auxiliar Administrativo',
         'Organização de documentos e cadastros.',
         'Conhecimentos administrativos.',
         'Administração', 'Estágio', 'aberta'),

        ('Clinica Vida', 'Auxiliar de Serviços Gerais',
         'Organização e limpeza do ambiente.',
         'Responsabilidade e organização.',
         'Serviços Gerais', 'CLT', 'aberta'),

        -- Supermercado Bom Preco
        ('Supermercado Bom Preco', 'Operador de Caixa',
         'Registro de compras e atendimento.',
         'Atenção e cordialidade.',
         'Comércio', 'CLT', 'aberta'),

        ('Supermercado Bom Preco', 'Repositor',
         'Reposição e organização de mercadorias.',
         'Organização e disposição.',
         'Comércio', 'CLT', 'aberta'),

        ('Supermercado Bom Preco', 'Auxiliar de Açougue',
         'Auxílio no atendimento e organização do setor.',
         'Interesse em aprender.',
         'Alimentação', 'CLT', 'aberta'),

        -- Papelaria Escolar
        ('Papelaria Escolar', 'Atendente',
         'Atendimento e orientação aos clientes.',
         'Boa comunicação.',
         'Atendimento', 'CLT', 'aberta'),

        ('Papelaria Escolar', 'Auxiliar de Escritório',
         'Organização de documentos e planilhas.',
         'Informática básica.',
         'Administração', 'Estágio', 'aberta'),

        ('Papelaria Escolar', 'Estoquista',
         'Organização e controle de materiais.',
         'Organização e atenção.',
         'Logística', 'CLT', 'pausada'),

        -- Academia Forca Total
        ('Academia Forca Total', 'Recepcionista',
         'Recepção e cadastro de alunos.',
         'Boa comunicação.',
         'Atendimento', 'CLT', 'aberta'),

        ('Academia Forca Total', 'Auxiliar Administrativo',
         'Apoio nas atividades administrativas.',
         'Informática básica.',
         'Administração', 'Estágio', 'aberta'),

        ('Academia Forca Total', 'Auxiliar de Limpeza',
         'Limpeza e organização dos ambientes.',
         'Responsabilidade e organização.',
         'Serviços Gerais', 'CLT', 'aberta')
) AS dados (
    nome_empresa,
    titulo,
    descricao,
    requisitos,
    area,
    tipo_contrato,
    status
)
INNER JOIN empresas e
    ON e.nome_fantasia = dados.nome_empresa;


-- =========================================
-- SEED: CANDIDATURAS
-- 20 candidaturas fictícias
-- =========================================

INSERT INTO candidaturas (
    vaga_id,
    candidato_id,
    status
)
SELECT
    v.id,
    c.id,
    dados.status
FROM (
    VALUES
        ('ana@email.com', 'Mercado Central', 'Operador de Caixa', 'pendente'),
        ('ana@email.com', 'Padaria Pao Bom', 'Atendente de Padaria', 'em_analise'),

        ('carlos@email.com', 'Loja Estilo', 'Vendedor', 'aprovada'),
        ('carlos@email.com', 'Supermercado Bom Preco', 'Operador de Caixa', 'pendente'),

        ('mariana@email.com', 'Clinica Vida', 'Auxiliar Administrativo', 'em_analise'),
        ('mariana@email.com', 'Papelaria Escolar', 'Auxiliar de Escritório', 'pendente'),

        ('pedro@email.com', 'Mercado Central', 'Auxiliar de Estoque', 'rejeitada'),
        ('pedro@email.com', 'Supermercado Bom Preco', 'Repositor', 'pendente'),

        ('lucas@email.com', 'Academia Forca Total', 'Auxiliar Administrativo', 'pendente'),
        ('lucas@email.com', 'Clinica Vida', 'Recepcionista', 'em_analise'),

        ('julia@email.com', 'Farmacia Popular', 'Atendente de Farmácia', 'aprovada'),
        ('julia@email.com', 'Loja Estilo', 'Auxiliar de Loja', 'pendente'),

        ('rafael@email.com', 'Oficina do Carro', 'Mecânico Auxiliar', 'em_analise'),
        ('rafael@email.com', 'Oficina do Carro', 'Recepcionista', 'pendente'),

        ('beatriz@email.com', 'Clinica Vida', 'Auxiliar de Serviços Gerais', 'pendente'),
        ('beatriz@email.com', 'Farmacia Popular', 'Auxiliar Administrativo', 'rejeitada'),

        ('gabriel@email.com', 'Restaurante Sabor', 'Garçom', 'aprovada'),
        ('gabriel@email.com', 'Restaurante Sabor', 'Auxiliar de Cozinha', 'pendente'),

        ('camila@email.com', 'Papelaria Escolar', 'Atendente', 'em_analise'),
        ('camila@email.com', 'Academia Forca Total', 'Recepcionista', 'pendente')
) AS dados (
    email_candidato,
    nome_empresa,
    titulo_vaga,
    status
)
INNER JOIN usuarios u
    ON u.email = dados.email_candidato
INNER JOIN candidatos c
    ON c.usuario_id = u.id
INNER JOIN empresas e
    ON e.nome_fantasia = dados.nome_empresa
INNER JOIN vagas v
    ON v.empresa_id = e.id
    AND v.titulo = dados.titulo_vaga;

COMMIT;
