-- =========================================
-- RESET DO BANCO DE TESTES
-- Remove os dados das tabelas do projeto
-- e reinicia os IDs.
-- =========================================

TRUNCATE TABLE
    candidaturas,
    vagas,
    empresas,
    candidatos,
    usuarios,
    localidades
RESTART IDENTITY CASCADE;
