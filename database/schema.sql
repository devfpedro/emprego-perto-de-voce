CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE cidades (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE bairros (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cidade_id BIGINT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,

    CONSTRAINT fk_bairros_cidade
        FOREIGN KEY (cidade_id) REFERENCES cidades(id),

    CONSTRAINT uq_bairros_cidade_nome
        UNIQUE (cidade_id, nome),

    CONSTRAINT chk_bairros_latitude
        CHECK (latitude BETWEEN -90 AND 90),

    CONSTRAINT chk_bairros_longitude
        CHECK (longitude BETWEEN -180 AND 180)
);

CREATE TABLE usuarios (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    perfil VARCHAR(10) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_usuarios_perfil
        CHECK (perfil IN ('candidato', 'empresa')),

    CONSTRAINT chk_usuarios_telefone
        CHECK (telefone ~ '^[0-9]+$')
);

CREATE TABLE candidatos (
    usuario_id BIGINT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    whatsapp VARCHAR(20),
    area_interesse VARCHAR(30) NOT NULL,
    bairro_id BIGINT NOT NULL,
    curriculo_path TEXT,

    CONSTRAINT fk_candidatos_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),

    CONSTRAINT fk_candidatos_bairro
        FOREIGN KEY (bairro_id) REFERENCES bairros(id),

    CONSTRAINT chk_candidatos_area
        CHECK (area_interesse IN (
            'alimentacao', 'comercio', 'saude',
            'servicos_gerais', 'educacao'
        )),

    CONSTRAINT chk_candidatos_whatsapp
        CHECK (whatsapp IS NULL OR whatsapp ~ '^[0-9]+$')
);

CREATE TABLE empresas (
    usuario_id BIGINT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cnpj CHAR(14) NOT NULL UNIQUE,
    descricao TEXT,
    setor VARCHAR(30) NOT NULL,
    site VARCHAR(255),
    bairro_id BIGINT NOT NULL,

    CONSTRAINT fk_empresas_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),

    CONSTRAINT fk_empresas_bairro
        FOREIGN KEY (bairro_id) REFERENCES bairros(id),

    CONSTRAINT chk_empresas_cnpj
        CHECK (cnpj ~ '^[0-9]{14}$'),

    CONSTRAINT chk_empresas_setor
        CHECK (setor IN (
            'alimentacao', 'comercio', 'saude',
            'servicos_gerais', 'educacao'
        ))
);

CREATE TABLE vagas (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT NOT NULL,
    requisitos TEXT NOT NULL,
    area VARCHAR(30) NOT NULL,
    contrato VARCHAR(20) NOT NULL,
    regime VARCHAR(15) NOT NULL,
    turno VARCHAR(15) NOT NULL,
    bairro_id BIGINT NOT NULL,
    salario NUMERIC(10, 2),
    status VARCHAR(15) NOT NULL DEFAULT 'aberta',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vagas_empresa
        FOREIGN KEY (empresa_id) REFERENCES empresas(usuario_id),

    CONSTRAINT fk_vagas_bairro
        FOREIGN KEY (bairro_id) REFERENCES bairros(id),

    CONSTRAINT chk_vagas_area
        CHECK (area IN (
            'alimentacao', 'comercio', 'saude',
            'servicos_gerais', 'educacao'
        )),

    CONSTRAINT chk_vagas_contrato
        CHECK (contrato IN (
            'clt', 'meio_periodo', 'temporario', 'estagio'
        )),

    CONSTRAINT chk_vagas_regime
        CHECK (regime IN ('presencial', 'hibrido', 'remoto')),

    CONSTRAINT chk_vagas_turno
        CHECK (turno IN ('integral', 'manha', 'tarde', 'noturno')),

    CONSTRAINT chk_vagas_status
        CHECK (status IN (
            'aberta', 'pausada', 'encerrada', 'cancelada'
        )),

    CONSTRAINT chk_vagas_salario
        CHECK (salario IS NULL OR salario > 0)
);

CREATE TABLE candidaturas (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vaga_id BIGINT NOT NULL,
    candidato_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'enviada',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_candidaturas_vaga
        FOREIGN KEY (vaga_id) REFERENCES vagas(id),

    CONSTRAINT fk_candidaturas_candidato
        FOREIGN KEY (candidato_id) REFERENCES candidatos(usuario_id),

    CONSTRAINT uq_candidaturas_vaga_candidato
        UNIQUE (vaga_id, candidato_id),

    CONSTRAINT chk_candidaturas_status
        CHECK (status IN (
            'enviada', 'em_analise', 'curriculo_visto',
            'entrevista', 'encerrada', 'rejeitada'
        ))
);

CREATE INDEX idx_vagas_status_area_bairro
    ON vagas (status, area, bairro_id);

CREATE INDEX idx_candidaturas_vaga
    ON candidaturas (vaga_id);

CREATE INDEX idx_candidaturas_candidato
    ON candidaturas (candidato_id);

CREATE INDEX idx_bairros_localizacao
    ON bairros
    USING GIST (
        geography(
            ST_SetSRID(
                ST_MakePoint(longitude, latitude),
                4326
            )
        )
    );


CREATE OR REPLACE FUNCTION validar_perfil_usuario()
    RETURNS TRIGGER AS $$
    DECLARE
        perfil_usuario VARCHAR(10);
        perfil_esperado VARCHAR(10);
    BEGIN
        perfil_esperado := CASE
            WHEN TG_TABLE_NAME = 'candidatos' THEN 'candidato'
            WHEN TG_TABLE_NAME = 'empresas' THEN 'empresa'
        END;

        SELECT perfil INTO perfil_usuario
        FROM usuarios
        WHERE id = NEW.usuario_id;

        IF perfil_usuario IS DISTINCT FROM perfil_esperado THEN
            RAISE EXCEPTION 'Perfil incompatível com o cadastro';
        END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_perfil_candidato
    BEFORE INSERT OR UPDATE ON candidatos
    FOR EACH ROW EXECUTE FUNCTION validar_perfil_usuario();

CREATE TRIGGER trg_validar_perfil_empresa
    BEFORE INSERT OR UPDATE ON empresas
    FOR EACH ROW EXECUTE FUNCTION validar_perfil_usuario();


CREATE OR REPLACE FUNCTION validar_cnpj(valor CHAR(14))
RETURNS BOOLEAN AS $$
DECLARE
    numeros INTEGER[];
    soma INTEGER;
    resto INTEGER;
    digito INTEGER;
    pesos1 INTEGER[] := ARRAY[5,4,3,2,9,8,7,6,5,4,3,2];
    pesos2 INTEGER[] := ARRAY[6,5,4,3,2,9,8,7,6,5,4,3,2];
    i INTEGER;
BEGIN
    IF valor !~ '^[0-9]{14}$' THEN
        RETURN FALSE;
    END IF;

    IF valor = repeat(substr(valor, 1, 1), 14) THEN
        RETURN FALSE;
    END IF;

    FOR i IN 1..14 LOOP
        numeros[i] := substr(valor, i, 1)::INTEGER;
    END LOOP;

    soma := 0;
    FOR i IN 1..12 LOOP
        soma := soma + numeros[i] * pesos1[i];
    END LOOP;

    resto := soma % 11;
    digito := CASE WHEN resto < 2 THEN 0 ELSE 11 - resto END;

    IF numeros[13] <> digito THEN
        RETURN FALSE;
    END IF;

    soma := 0;
    FOR i IN 1..13 LOOP
        soma := soma + numeros[i] * pesos2[i];
    END LOOP;

    resto := soma % 11;
    digito := CASE WHEN resto < 2 THEN 0 ELSE 11 - resto END;

    RETURN numeros[14] = digito;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

ALTER TABLE empresas
ADD CONSTRAINT chk_empresas_cnpj_valido
CHECK (validar_cnpj(cnpj));


CREATE OR REPLACE FUNCTION atualizar_data_modificacao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_atualizar_vagas
BEFORE UPDATE ON vagas
FOR EACH ROW
EXECUTE FUNCTION atualizar_data_modificacao();

CREATE TRIGGER trg_atualizar_candidaturas
BEFORE UPDATE ON candidaturas
FOR EACH ROW
EXECUTE FUNCTION atualizar_data_modificacao();
-- Indice para consultas de vagas por empresa
CREATE INDEX IF NOT EXISTS idx_vagas_empresa_id
ON vagas (empresa_id);
