
-- =====================================================
-- EMPREGO PERTO DE VOCE
-- Schema inicial v1
-- PostgreSQL 16 + PostGIS 3
-- =====================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. USUARIOS
CREATE TABLE usuarios (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL,

    CONSTRAINT chk_usuarios_tipo
        CHECK (tipo IN ('candidato', 'empresa'))
);

-- 2. LOCALIDADES
CREATE TABLE localidades (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cidade VARCHAR(100) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,

    CONSTRAINT uq_localidades_cidade_bairro
        UNIQUE (cidade, bairro),

    CONSTRAINT chk_localidades_latitude
        CHECK (latitude BETWEEN -90 AND 90),

    CONSTRAINT chk_localidades_longitude
        CHECK (longitude BETWEEN -180 AND 180)
);

-- 3. CANDIDATOS
CREATE TABLE candidatos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id BIGINT NOT NULL UNIQUE,
    cidade VARCHAR(100) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    area_interesse VARCHAR(100) NOT NULL,
    resumo_profissional TEXT,

    CONSTRAINT fk_candidatos_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id),

    CONSTRAINT fk_candidatos_localidade
        FOREIGN KEY (cidade, bairro)
        REFERENCES localidades(cidade, bairro)
);

-- 4. EMPRESAS
CREATE TABLE empresas (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id BIGINT NOT NULL UNIQUE,
    nome_fantasia VARCHAR(150) NOT NULL,
    descricao TEXT,
    cidade VARCHAR(100) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),

    CONSTRAINT fk_empresas_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id),

    CONSTRAINT fk_empresas_localidade
        FOREIGN KEY (cidade, bairro)
        REFERENCES localidades(cidade, bairro),

    CONSTRAINT chk_empresas_coordenadas
            CHECK (
    (latitude IS NULL AND longitude IS NULL)
    OR
    (
        latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND latitude BETWEEN -90 AND 90
        AND longitude BETWEEN -180 AND 180
    )
)
);

-- 5. VAGAS
CREATE TABLE vagas (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT NOT NULL,
    requisitos TEXT,
    area VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    tipo_contrato VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'aberta',
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vagas_empresa
        FOREIGN KEY (empresa_id)
        REFERENCES empresas(id),

    CONSTRAINT fk_vagas_localidade
        FOREIGN KEY (cidade, bairro)
        REFERENCES localidades(cidade, bairro),

    CONSTRAINT chk_vagas_status
        CHECK (status IN ('aberta', 'pausada', 'encerrada', 'cancelada')),

    CONSTRAINT chk_vagas_coordenadas
            CHECK (
                (latitude IS NULL AND longitude IS NULL)
                OR
                (
                    latitude IS NOT NULL
                    AND longitude IS NOT NULL
                    AND latitude BETWEEN -90 AND 90
                    AND longitude BETWEEN -180 AND 180
                )
            )
);

-- 6. CANDIDATURAS
CREATE TABLE candidaturas (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vaga_id BIGINT NOT NULL,
    candidato_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente',
    data_candidatura TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_candidaturas_vaga
        FOREIGN KEY (vaga_id)
        REFERENCES vagas(id),

    CONSTRAINT fk_candidaturas_candidato
        FOREIGN KEY (candidato_id)
        REFERENCES candidatos(id),

    CONSTRAINT uq_candidaturas_vaga_candidato
        UNIQUE (vaga_id, candidato_id),

    CONSTRAINT chk_candidaturas_status
        CHECK (
            status IN (
                'pendente',
                'em_analise',
                'aprovada',
                'rejeitada',
                'cancelada'
            )
        )
);
