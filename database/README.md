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
| `schema.sql` | Criação das tabelas, relacionamentos, restrições, funções, triggers e índices. |
| `seed.sql` | Inserção de dados fictícios para demonstração e testes. |
| `reset.sql` | Limpeza dos dados e reinicialização dos identificadores. |
| `indexes.sql` | Arquivo reservado para índices adicionais. |
| `docker-compose.yml` | Configuração do ambiente PostgreSQL com PostGIS. |
| `DER.md` | Documentação do diagrama entidade-relacionamento. |

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

## Contas de demonstração

O arquivo `seed.sql` disponibiliza 14 contas fictícias para testes de autenticação.

**Senha de todas as contas:** `Teste@1234`

### Candidatos

- candidato1@email.com
- candidato2@email.com
- candidato3@email.com
- candidato4@email.com
- candidato5@email.com
- candidato6@email.com
- candidato7@email.com
- candidato8@email.com

### Empresas

- empresa1@email.com
- empresa2@email.com
- empresa3@email.com
- empresa4@email.com
- empresa5@email.com
- empresa6@email.com

**Atenção:** essas contas e a senha são destinadas exclusivamente a testes e demonstrações. Nunca utilize essa senha em contas reais.

## Configuração com Docker

O projeto utiliza Docker Compose para executar o PostgreSQL com PostGIS em um container independente.

O banco utiliza a porta `5433` do computador, mapeada para a porta `5432` do container.

### 1. Iniciar o banco de dados

Execute na raiz do projeto:

```bash
sudo docker compose -f database/docker-compose.yml up -d
```

Na primeira inicialização, o Docker cria o volume e executa automaticamente os scripts:

- `01-schema.sql`: cria a extensão PostGIS, as tabelas, os relacionamentos, os índices, as funções e os triggers.
- `02-seed.sql`: insere os dados fictícios de demonstração.

Não é necessário executar esses arquivos manualmente.

### 2. Verificar a inicialização

Para acompanhar os logs:

```bash
sudo docker compose -f database/docker-compose.yml logs --tail=80
```

Para acessar o banco:

```bash
sudo docker exec -it emprego-perto-db psql -U emprego_user -d emprego_perto_de_voce
```

**Importante:** os scripts de inicialização são executados somente quando o volume do banco é criado pela primeira vez. Nas inicializações seguintes, os dados existentes são preservados.

### 3. Recriar o banco do zero

Caso seja necessário executar novamente o schema e o seed automaticamente, remova o volume e crie o ambiente novamente:

```bash
sudo docker compose -f database/docker-compose.yml down -v
sudo docker compose -f database/docker-compose.yml up -d
```

**Atenção:** o comando `down -v` apaga o volume e todos os dados armazenados no banco. Utilize somente quando desejar recriar o ambiente de testes do zero.

## Consultas e testes

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

**Atenção:** esse procedimento apaga os registros das sete tabelas. Utilize somente em ambiente de testes.

Após a limpeza, os dados podem ser inseridos novamente:

```bash
sudo docker exec -i emprego-perto-db psql -U emprego_user -d emprego_perto_de_voce -v ON_ERROR_STOP=1 < database/seed.sql
```

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

Remover o container sem apagar o volume de dados:

```bash
sudo docker compose -f database/docker-compose.yml down
```

**Importante:** os dados são armazenados no volume Docker `database_emprego_perto_data`. Não utilize `down -v` se desejar preservar o banco.

## Backup e restauração

### Criar backup

Para gerar um backup completo do banco de dados:

```bash
sudo docker exec emprego-perto-db pg_dump -U emprego_user -d emprego_perto_de_voce -F c -f /tmp/emprego_perto.backup
sudo docker cp emprego-perto-db:/tmp/emprego_perto.backup ./database/emprego_perto.backup
```

O arquivo será salvo em `database/emprego_perto.backup`, fora do container.

### Restaurar backup

Para restaurar o backup em um banco existente:

```bash
sudo docker cp ./database/emprego_perto.backup emprego-perto-db:/tmp/emprego_perto.backup
sudo docker exec emprego-perto-db pg_restore -U emprego_user -d emprego_perto_de_voce --clean --if-exists /tmp/emprego_perto.backup
```

**Atenção:** a opção `--clean` remove os objetos existentes que serão restaurados. Utilize somente quando desejar substituir a estrutura e os dados atuais.

Mantenha os arquivos de backup em local seguro e não os envie ao Git.

## Observações

- Os dados do `seed.sql` são fictícios e destinados exclusivamente a testes.
- As senhas das contas de demonstração estão armazenadas em formato de hash compatível com a autenticação do Werkzeug.
- As coordenadas geográficas dos bairros são aproximadas.
- O PostGIS é utilizado para consultas geográficas.
- O `schema.sql` e o `seed.sql` são executados automaticamente na primeira criação do volume.
- O container deste projeto utiliza a porta `5433`, sem interferir em outros bancos executados na máquina.
