# Banco de Dados — Emprego Perto de Você

Este diretório contém os arquivos responsáveis pela criação, configuração, documentação e popularização do banco de dados do projeto **Emprego Perto de Você**.

## Tecnologias utilizadas

- PostgreSQL 17
- PostGIS 3.5
- Docker
- Docker Compose

## Estrutura de arquivos

| Arquivo | Descrição |
|---|---|
| `schema.sql` | Criação das tabelas, relacionamentos, restrições, funções e triggers. |
| `seed.sql` | Inserção de dados fictícios para testes. |
| `reset.sql` | Limpeza dos dados e reinicialização dos identificadores. |
| `indexes.sql` | Criação de índices adicionais. |
| `docker-compose.yml` | Configuração do ambiente PostgreSQL com PostGIS. |
| `DER.md` | Documentação do diagrama entidade-relacionamento. |
| `migrations/` | Scripts de alterações futuras na estrutura do banco. |

## Estrutura do banco

O banco possui sete tabelas:

- **cidades:** armazena os municípios cadastrados.
- **bairros:** armazena os bairros, vinculados às cidades, com coordenadas geográficas aproximadas.
- **usuarios:** armazena os dados de acesso, perfil e contato dos usuários.
- **candidatos:** armazena informações profissionais e dados dos candidatos.
- **empresas:** armazena informações cadastrais das empresas.
- **vagas:** registra as oportunidades de emprego disponibilizadas pelas empresas.
- **candidaturas:** registra as candidaturas realizadas pelos candidatos.

Os relacionamentos utilizam chaves primárias e estrangeiras, restrições de integridade, índices e triggers.

Cada usuário pode possuir um perfil de candidato ou empresa. Uma candidatura não pode ser duplicada para a mesma combinação de candidato e vaga.

O PostGIS permite realizar consultas geográficas, incluindo buscas por proximidade.

## Configuração com Docker

O projeto utiliza Docker Compose para executar o PostgreSQL com PostGIS em um container independente.

O banco utiliza a porta `5433` do computador, mapeada para a porta `5432` do container.

### 1. Iniciar o container

Execute na raiz do projeto:

```bash
sudo docker compose -f database/docker-compose.yml up -d
```

### 2. Criar a estrutura

Execute:

```bash
sudo docker exec -i emprego-perto-db psql -U emprego_user -d emprego_perto_de_voce < database/schema.sql
```

Esse script cria a extensão PostGIS, as sete tabelas, os índices, as funções e os triggers.

Execute apenas na criação inicial do banco, em uma instância vazia.

### 3. Inserir dados de teste

Execute:

```bash
sudo docker exec -i emprego-perto-db psql -U emprego_user -d emprego_perto_de_voce < database/seed.sql
```

O arquivo `seed.sql` contém dados fictícios para testar os relacionamentos e as consultas.

### 4. Criar índices adicionais

Execute:

```bash
sudo docker exec -i emprego-perto-db psql -U emprego_user -d emprego_perto_de_voce -v ON_ERROR_STOP=1 -f /dev/stdin < database/indexes.sql
```

## Consultas e testes

Para acessar o banco:

```bash
sudo docker exec -it emprego-perto-db psql -U emprego_user -d emprego_perto_de_voce
```

Verificar as tabelas:

```sql
\dt
```

Verificar a quantidade de registros:

```sql
SELECT 'cidades' AS tabela, COUNT(*) FROM cidades
UNION ALL SELECT 'bairros', COUNT(*) FROM bairros
UNION ALL SELECT 'usuarios', COUNT(*) FROM usuarios
UNION ALL SELECT 'candidatos', COUNT(*) FROM candidatos
UNION ALL SELECT 'empresas', COUNT(*) FROM empresas
UNION ALL SELECT 'vagas', COUNT(*) FROM vagas
UNION ALL SELECT 'candidaturas', COUNT(*) FROM candidaturas;
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

Para remover os registros e reiniciar os identificadores:

```bash
sudo docker exec -i emprego-perto-db psql -U emprego_user -d emprego_perto_de_voce -v ON_ERROR_STOP=1 < database/reset.sql
```

**Atenção:** esse procedimento apaga todos os registros das sete tabelas. Utilize somente em ambiente de testes.

Após a limpeza, os dados podem ser inseridos novamente executando `seed.sql`.

## Gerenciamento do container

Verificar os containers em execução:

```bash
sudo docker ps
```

Acompanhar os logs:

```bash
sudo docker compose -f database/docker-compose.yml logs -f
```

Parar o container:

```bash
sudo docker compose -f database/docker-compose.yml stop
```

Iniciar novamente:

```bash
sudo docker compose -f database/docker-compose.yml start
```

Para remover o container sem apagar o volume de dados:

```bash
sudo docker compose -f database/docker-compose.yml down
```

**Importante:** os dados são armazenados no volume Docker `emprego_perto_data`. Não utilize `down -v` se desejar preservar o banco.

## Observações

- Os dados do `seed.sql` são fictícios e destinados exclusivamente a testes.
- Os valores de `senha_hash` são placeholders, não hashes válidos para autenticação.
- As coordenadas geográficas dos bairros são aproximadas.
- O PostGIS é utilizado para consultas geográficas.
- O `schema.sql` deve ser executado apenas na criação inicial da estrutura.
- O container deste projeto utiliza a porta `5433`, sem interferir em outros bancos executados na máquina.