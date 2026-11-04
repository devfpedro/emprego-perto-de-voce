-- =========================================
-- INDICES ADICIONAIS DO BANCO DE DADOS
-- =========================================

-- Busca de vagas pertencentes a uma empresa
CREATE INDEX IF NOT EXISTS idx_vagas_empresa_id
ON vagas (empresa_id);