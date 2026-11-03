-- =========================================
-- INDICES DO BANCO DE DADOS
-- =========================================

-- Busca de candidatos por localidade
CREATE INDEX idx_candidatos_localidade
ON candidatos (cidade, bairro);

-- Busca de empresas por localidade
CREATE INDEX idx_empresas_localidade
ON empresas (cidade, bairro);

-- Busca de vagas pertencentes a uma empresa
CREATE INDEX idx_vagas_empresa_id
ON vagas (empresa_id);

-- Busca de vagas por localidade e status
CREATE INDEX idx_vagas_localidade_status
ON vagas (cidade, bairro, status);

-- Busca de candidaturas de um candidato
CREATE INDEX idx_candidaturas_candidato_id
ON candidaturas (candidato_id);

-- =========================================
-- INDICE ESPACIAL POSTGIS
-- =========================================

CREATE INDEX idx_vagas_localizacao_gist
ON vagas
USING GIST (
    (
        ST_SetSRID(
            ST_MakePoint(
                longitude::double precision,
                latitude::double precision
            ),
            4326
        )::geography
    )
)
WHERE latitude IS NOT NULL
  AND longitude IS NOT NULL;
