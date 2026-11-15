# Emprego Perto de Você 📍

O **Emprego Perto de Você** é uma plataforma digital focada em conectar candidatos a oportunidades de trabalho locais de forma simplificada e geolocalizada. O objetivo é atender pequenas e médias empresas que precisam preencher vagas com moradores da própria região ou bairro.

## 💻 Sobre o Projeto

Este Produto Mínimo Viável (MVP) está sendo desenvolvido pela equipe **Iteravise** como parte da disciplina de Gerência de Projetos de Software, do curso de Sistemas para Internet.

O projeto é gerenciado utilizando metodologias ágeis, como Scrum e Kanban, com apoio do Jira e ciclos semanais de entrega (Sprints).

## 🛠️ Tecnologias Utilizadas

- **Front-end:** React Native e Expo
- **Back-end:** Python e Flask
- **Banco de Dados:** PostgreSQL 17 e PostGIS 3.5
- **Comunicação com o banco:** Psycopg
- **Autenticação:** JWT
- **Geolocalização:** PostGIS e cálculo de distância por Haversine
- **Infraestrutura do banco:** Docker e Docker Compose
- **Rotas do aplicativo:** Expo Router
- **Testes de API:** Postman
- **Gerenciamento:** Jira
- **Prototipação:** Figma
- **Versionamento:** Git e GitHub

## 📁 Estrutura do Projeto

O projeto está organizado em três partes principais:

```text
emprego-perto-de-voce/
├── backend/       # API desenvolvida com Python e Flask
├── database/      # Banco de dados, scripts SQL e Docker Compose
├── mobile/        # Aplicativo desenvolvido com React Native e Expo
├── LICENSE
└── README.md
```

## 📚 Documentação

| Documento | Conteúdo |
|---|---|
| [`backend/api.md`](backend/api.md) | Contrato da API: rotas, payloads, validações e telas que usam cada rota |
| [`backend/postman-test`](backend/postman-test) | Exportação das requisições de teste da API (Insomnia) |
| [`database/README.md`](database/README.md) | Configuração do banco, contas de teste, reinício e backup |
| [`database/DER.md`](database/DER.md) | Diagrama entidade-relacionamento |
| [Documentação de Telas e Fluxos](mobile/docs/telas-e-fluxos/Documenta%C3%A7%C3%A3o%20de%20Telas%20e%20Fluxos.md) | Campos, validações e estados de cada tela do aplicativo |

## 🗄️ Banco de Dados

O sistema utiliza PostgreSQL 17 com a extensão espacial PostGIS 3.5, permitindo armazenar informações relacionais e coordenadas geográficas.

O banco de dados é composto pelas seguintes tabelas principais:

| Tabela | Responsabilidade |
|---|---|
| `usuarios` | Armazena os dados de autenticação e perfil dos usuários |
| `candidatos` | Armazena informações dos candidatos |
| `empresas` | Armazena informações das empresas |
| `cidades` | Registra as cidades disponíveis |
| `bairros` | Armazena bairros e suas coordenadas geográficas |
| `vagas` | Registra as oportunidades de emprego |
| `candidaturas` | Registra as candidaturas realizadas pelos candidatos |

### Relacionamentos

As principais relações entre as tabelas são:

- Um usuário pode possuir um perfil de candidato ou empresa.
- Candidatos e empresas estão associados a usuários.
- Bairros pertencem a cidades.
- Candidatos e empresas podem estar associados a bairros.
- Vagas estão vinculadas a empresas e bairros.
- Candidaturas relacionam candidatos às vagas.

### Índices e integridade

O banco utiliza chaves primárias, chaves estrangeiras, restrições de integridade e índices para melhorar a organização e a consulta dos dados.

Também possui um índice espacial GiST para auxiliar operações geográficas relacionadas à localização dos bairros.

## 📍 Geolocalização e Busca por Proximidade

Uma das funcionalidades importantes do sistema é a busca de vagas considerando a localização geográfica do candidato.

A API permite utilizar:

- Latitude e longitude como referência de localização.
- Raio de busca configurável em quilômetros.
- Cálculo da distância entre o ponto de referência e a localização da vaga.
- Retorno da distância da vaga no resultado da consulta.
- Utilização da localização do bairro do candidato como referência quando as coordenadas não são informadas, conforme a lógica implementada.

A implementação utiliza o cálculo de distância por Haversine na rota de listagem de vagas.

O banco também foi validado com operações espaciais do PostGIS, incluindo `ST_Distance` e `ST_DWithin`.

**Observação técnica:** embora o banco possua índice espacial GiST e os testes SQL com `ST_DWithin` tenham sido realizados, a rota atual de listagem de vagas calcula a distância utilizando Haversine no Python, após consultar os registros no banco.

## 🚀 Como Executar o Projeto

### 1. Banco de Dados

**Pré-requisitos:** Docker e Docker Compose instalados.

Na raiz do projeto, execute:

```bash
docker compose -f database/docker-compose.yml up -d
```

O banco será iniciado com as seguintes configurações:

| Configuração | Valor |
|---|---|
| Banco | emprego_perto_de_voce |
| Usuário | emprego_user |
| Porta local | 5433 |
| Tecnologia | PostgreSQL 17 + PostGIS 3.5 |

Na primeira inicialização, o Docker executa automaticamente os scripts `schema.sql` (tabelas, índices, funções e triggers) e `seed.sql` (dados fictícios de demonstração). **Não é necessário executá-los manualmente.**

**Observação:** esses scripts rodam somente quando o volume do banco é criado pela primeira vez. Nas próximas inicializações, os dados existentes são preservados. O arquivo `indexes.sql` está reservado para índices adicionais e não faz parte da inicialização.

Para recriar o banco do zero, apagando todos os dados do ambiente de testes:

```bash
docker compose -f database/docker-compose.yml down -v
docker compose -f database/docker-compose.yml up -d
```

Para acessar o PostgreSQL pelo terminal:

```bash
docker exec -it emprego-perto-db psql -U emprego_user -d emprego_perto_de_voce
```

**Contas de teste:** o `seed.sql` cria 14 contas fictícias (8 candidatos, como `candidato1@email.com`, e 6 empresas, como `empresa1@email.com`), todas com a senha `Teste@1234`. Use-as somente em testes e demonstrações; veja a lista completa em [`database/README.md`](database/README.md).

### 2. Back-end (API Flask)

**Pré-requisitos:** Python 3 e pip instalados.

Entre na pasta do back-end:

```bash
cd backend
```

Crie um ambiente virtual:

```bash
python3 -m venv .venv
```

Ative o ambiente virtual:

```bash
source .venv/bin/activate
```

No Windows (PowerShell), use `.venv\Scripts\Activate.ps1` para ativar o ambiente e `python` no lugar de `python3`.

Instale as dependências:

```bash
pip install -r requirements.txt
```

Crie o arquivo de configuração local a partir do exemplo:

```bash
cp .env.example .env
```

O arquivo `.env` contém a porta da API (`PORT`), a chave JWT (`JWT_SECRET`) e a conexão com o banco (`DATABASE_URL`, que já aponta para a porta 5433 do Docker). Configure uma chave secreta própria para o ambiente local.

Inicie a API:

```bash
python run.py
```

Por padrão, o back-end será executado na porta **8000**.

Para verificar se a API está respondendo, acesse:

```text
http://localhost:8000/saude
```

Resposta esperada:

```json
{
  "ok": true
}
```

### 3. Aplicativo Mobile (React Native + Expo)

**Pré-requisitos:** Node.js e npm instalados.

Abra outro terminal e entre na pasta do aplicativo:

```bash
cd mobile
```

Instale as dependências:

```bash
npm install
```

Inicie o Expo:

```bash
npx expo start
```

Siga as instruções exibidas no terminal para executar o aplicativo no dispositivo ou emulador compatível.

**Observação sobre a integração:** na versão atual da branch `main`, o arquivo `mobile/src/service/api.ts` ainda usa `USE_MOCK = true` (dados simulados) e a `BASE_URL` `http://192.168.1.10:3333`, com login em `/sessions`. Para usar a API real, é preciso apontar a `BASE_URL` para o back-end Flask (porta 8000, com o IP do computador quando o teste for no celular), usar `POST /auth/login` e adaptar a resposta da API, que retorna `token`, `perfil` e `usuario`.

## 🔌 Principais Endpoints da API

A API disponibiliza funcionalidades de autenticação, consulta de vagas, gerenciamento de empresas e candidaturas. As rotas protegidas exigem o cabeçalho `Authorization: Bearer <token>`. O detalhamento de cada rota está em [`backend/api.md`](backend/api.md).

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/saude` | Verifica se a API está funcionando |
| POST | `/auth/cadastro` | Realiza o cadastro de usuário |
| POST | `/auth/login` | Realiza a autenticação |
| GET | `/localidades` | Consulta cidades e bairros disponíveis |
| GET | `/empresas` | Lista empresas e a quantidade de vagas abertas |
| GET | `/empresas/{id}` | Consulta uma empresa e suas vagas abertas |
| GET | `/vagas` | Lista vagas disponíveis |
| GET | `/vagas/{id}` | Consulta uma vaga específica |
| POST | `/vagas` | Cadastra uma vaga |
| PUT | `/vagas/{id}` | Atualiza uma vaga |
| POST | `/vagas/{id}/candidaturas` | Candidata-se a uma vaga (perfil candidato) |
| GET | `/empresa/vagas` | Lista vagas da empresa autenticada |
| GET | `/empresa/candidaturas` | Lista candidaturas recebidas pela empresa, com filtros `vagaId` e `status` |
| GET | `/candidaturas/minhas` | Lista candidaturas do candidato autenticado |
| PATCH | `/candidaturas/{id}/status` | Altera o status de uma candidatura (empresa dona da vaga) |

### Parâmetros de busca de vagas

A rota `GET /vagas` permite utilizar parâmetros de consulta, entre eles:

| Parâmetro | Descrição |
|---|---|
| `q` | Pesquisa textual |
| `area` | Filtra pela área de atuação |
| `contrato` | Filtra pelo tipo de contrato |
| `bairroId` | Filtra pelo identificador do bairro |
| `lat` | Latitude da localização de referência |
| `lng` | Longitude da localização de referência |
| `raioKm` | Raio máximo de busca em quilômetros |

Exemplo:

```text
GET /vagas?lat=-6.854800&lng=-35.490200&raioKm=1
```

Esse exemplo consulta vagas abertas em um raio de 1 km a partir das coordenadas informadas.

## 🧪 Testes e Validações

Foram realizados testes utilizando requisições HTTP, consultas SQL e verificações de integração entre a API e o banco de dados.

### Testes da API

As requisições de teste estão na coleção [`backend/postman-test`](backend/postman-test), exportada do Insomnia.

Foram verificadas operações como:

- Cadastro e autenticação de usuários.
- Consulta de localidades.
- Listagem e consulta individual de vagas.
- Criação e atualização de vagas.
- Candidatura a vagas e consulta de candidaturas.
- Painel da empresa.
- Validações de dados obrigatórios e formatos inválidos.
- Controle de permissões de acesso.

### Testes do banco de dados

Foram realizadas verificações de:

- Quantidade de registros nas tabelas principais.
- Integridade dos relacionamentos e chaves estrangeiras.
- Associação entre candidatos, empresas, usuários e vagas.
- Validade das coordenadas geográficas dos bairros.
- Cálculo de distância utilizando PostGIS.
- Consulta de bairros dentro de um raio de distância.

### Teste de integração geográfica

Foi realizado um teste utilizando como referência as coordenadas do Centro de Guarabira:

```text
Latitude:  -6.854800
Longitude: -35.490200
Raio:      1 km
```

O resultado da consulta da API retornou quatro vagas abertas:

| Vaga | Bairro | Distância aproximada |
|---|---|---:|
| Atendente de Loja | Centro | 0,00 km |
| Operador de Caixa | Novo | 0,78 km |
| Repositor | Jua | 0,78 km |
| Auxiliar Administrativo | Centro | 0,00 km |

O resultado foi compatível com a consulta de validação realizada diretamente no banco de dados.

**Status dos testes:** os resultados acima representam os cenários efetivamente executados. Outros casos de validação, permissões, filtros e integração com a interface permanecem sujeitos à execução e confirmação pela equipe de QA.

## 📋 Melhorias e Próximas Validações

Entre os pontos que podem receber continuidade nas próximas etapas estão:

- Concluir os testes de validação de cadastro.
- Verificar os cenários de salário inválido e salário nulo na atualização de vagas.
- Isolar os testes de candidatura duplicada e candidatura em vaga não aberta.
- Validar os diferentes estados das vagas.
- Confirmar a atualização de status das candidaturas.
- Validar os filtros de candidaturas em andamento e encerradas.
- Testar o fallback de localização pelo bairro do candidato.
- Validar a apresentação de vagas sem salário informado como “A combinar”.
- Avaliar a utilização de `ST_DWithin` diretamente na consulta da API para aproveitar o índice espacial GiST, caso seja adotada essa otimização.

## 👥 Equipe Iteravise

O desenvolvimento e a gerência do projeto funcionam em um sistema de rodízio semanal de funções entre os membros:

- Artur Crispim de Andrade
- Erick Felipe Santos Menezes
- Juan Nicolas Gomes dos Santos
- Paulo Gomes de Sousa Junior
- Pedro Henrique Santos de Pontes

---

📄 **Licença:** Este projeto está sob a licença MIT.