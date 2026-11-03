# Banco de Dados — Emprego Perto de Você

Este diretório contém os scripts SQL responsáveis pela criação, configuração e popularização do banco de dados do projeto **Emprego Perto de Você**.

## Tecnologias utilizadas

- PostgreSQL 16
- PostGIS 3

## Estrutura de arquivos

| Arquivo | Descrição |
|---|---|
| `schema.sql` | Criação das tabelas, chaves e restrições do banco. |
| `seed.sql` | Inserção de dados fictícios para testes. |
| `reset.sql` | Remoção dos dados e reinicialização dos identificadores. |
| `indexes.sql` | Criação dos índices para otimizar consultas. |
| `migrations/` | Scripts de alterações futuras na estrutura do banco. |

## Estrutura do banco

O banco possui seis tabelas principais:

- **usuarios:** armazena os dados de acesso e o tipo de usuário.
- **candidatos:** armazena informações profissionais e a localidade de interesse dos candidatos.
- **empresas:** armazena informações das empresas cadastradas.
- **vagas:** armazena as oportunidades de emprego disponibilizadas pelas empresas.
- **candidaturas:** registra as candidaturas realizadas pelos candidatos.
- **localidades:** armazena cidades, bairros e suas coordenadas geográficas de referência.

O relacionamento entre as tabelas utiliza chaves primárias e estrangeiras, além de restrições para manter a integridade dos dados.

## Configuração do banco

### 1. Criar o banco de dados

No terminal Linux, execute:

```bash
sudo -u postgres createdb emprego_perto_de_voce
```

### 2. Criar a estrutura

Execute na raiz do projeto:

```bash
sudo -u postgres psql -d emprego_perto_de_voce -v ON_ERROR_STOP=1 -f database/schema.sql
```

Esse script cria a extensão PostGIS e as seis tabelas do projeto.

### 3. Inserir dados de teste

```bash
sudo -u postgres psql -d emprego_perto_de_voce -v ON_ERROR_STOP=1 -f database/seed.sql
```

O arquivo `seed.sql` contém dados fictícios para testar os relacionamentos e as consultas.

### 4. Criar os índices

```bash
sudo -u postgres psql -d emprego_perto_de_voce -v ON_ERROR_STOP=1 -f database/indexes.sql
```

Os índices auxiliam nas consultas por localidade, empresa, candidaturas e localização geográfica.

## Consultas e testes

Para acessar o banco:

```bash
sudo -u postgres psql -d emprego_perto_de_voce
```

Verificar as tabelas:

```sql
\dt
```

Verificar a quantidade de registros:

```sql
SELECT 'usuarios' AS tabela, COUNT(*) FROM usuarios
UNION ALL
SELECT 'localidades', COUNT(*) FROM localidades
UNION ALL
SELECT 'candidatos', COUNT(*) FROM candidatos
UNION ALL
SELECT 'empresas', COUNT(*) FROM empresas
UNION ALL
SELECT 'vagas', COUNT(*) FROM vagas
UNION ALL
SELECT 'candidaturas', COUNT(*) FROM candidaturas;
```

Verificar a versão do PostGIS:

```sql
SELECT PostGIS_Version();
```

Sair do PostgreSQL:

```sql
\q
```

## Limpeza do banco de testes

Para remover os dados das tabelas e reiniciar os identificadores:

```bash
sudo -u postgres psql -d emprego_perto_de_voce -v ON_ERROR_STOP=1 -f database/reset.sql
```

**Atenção:** esse procedimento apaga todos os registros das seis tabelas do projeto. Utilize somente em ambiente de testes.

Após a limpeza, os dados podem ser inseridos novamente executando `seed.sql`.

## Observações

- Os dados do `seed.sql` são fictícios e destinados exclusivamente a testes.
- Os valores de `senha_hash` são placeholders, não hashes válidos para autenticação.
- As coordenadas geográficas utilizadas nos dados de teste são aproximadas.
- O PostGIS é utilizado para consultas geográficas, como a busca de vagas próximas a uma determinada localização.
- O `schema.sql` deve ser executado em um banco vazio, apenas na criação inicial da estrutura.
