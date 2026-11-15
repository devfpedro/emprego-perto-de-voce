# Plano de Testes - Emprego Perto de Você

**Equipe:** Iteravise · **Sprint:** 6 · **Responsável:** Pedro Henrique
**Versão:** 0.2 (15/11/2026), revisada após a execução dos testes. A versão 0.1 era um rascunho de 13/11/2026.

## 1. Objetivo

Verificar se a API e o fluxo principal do aplicativo funcionam conforme o contrato (`backend/api.md`) e os requisitos do Termo de Abertura, e registrar evidências no Relatório de Testes ([`relatorio-de-testes-sprint6.md`](relatorio-de-testes-sprint6.md)).

## 2. Escopo

**Dentro do escopo**
- API REST (Flask): autenticação, localidades, vagas, candidaturas e painel da empresa.
- Banco de dados: integridade, índices, reinício, backup e restauração.
- Desempenho e concorrência da API (rodada 3) e permissões, token e contrato (rodada 4).
- Fluxo do candidato no app (Expo Go).

**Fora do escopo:** HTTPS e infraestrutura de produção, acessibilidade, upload de currículo (não há rota), paginação (não existe) e testes automatizados no repositório (não existem).

## 3. Ambiente e ferramentas

| Item | Detalhe |
|---|---|
| API | Flask em `http://127.0.0.1:8000` (em Windows, `localhost` resolve primeiro para IPv6 e a API escuta só IPv4, D25) |
| Banco | PostgreSQL 17 + PostGIS 3.5 (Docker, porta 5433), populado por `seed.sql` |
| Execução das requisições | Scripts em Python (`requests`); coleção Postman em [`postman/`](postman/) para repetir os principais casos (a coleção `backend/postman-test`, do Insomnia, é a base da Sprint 5) |
| Banco (consultas) | `docker exec ... psql` e `psycopg` |
| App | Expo Go em celular Android (USB, `adb reverse`) |
| Contas | 14 contas do seed (8 candidatos, 6 empresas), senha `Teste@1234` |
| Dados | Apenas fictícios |

As vagas do seed (1 a 24) não foram editadas: os testes que alteram vagas usam vagas criadas durante os próprios testes. Tokens não são registrados nos documentos.

## 4. Critérios

- **Passou:** status HTTP e corpo conforme o resultado esperado.
- **Falhou:** qualquer divergência. Registrar a evidência e abrir um defeito (Dn) para o responsável (back-end, front-end, banco ou documentação).
- **Bloqueado:** pré-condição indisponível (ex.: app ainda não integrado à API).
- **Observação:** comportamento registrado sem resultado esperado definido no contrato.

Os testes devem ser reexecutados após as correções (regressão).

## 5. Casos de teste

"Token C" é o JWT de um candidato do seed e "Token E" o de uma empresa do seed. Resultados finais da sprint na coluna da direita (detalhes no relatório).

| ID | Funcionalidade | Passos | Resultado esperado | Resultado na Sprint 6 |
|---|---|---|---|---|
| T01 | Login válido | `POST /auth/login` com e-mail e senha de conta do seed | `200`; corpo com `token`, `perfil` e `usuario` (id, nome, e-mail) | Passou |
| T02 | Login inválido | `POST /auth/login` com senha errada; repetir com e-mail inexistente e com campos vazios | `401` com `erro: "E-mail ou senha inválidos."` nos três casos | Passou |
| T03 | Cadastro de candidato | `POST /auth/cadastro` com `perfil: candidato` e dados fictícios válidos | `201` com mensagem e `id`; login com a nova conta funciona | Passou |
| T04 | Validações do cadastro | Enviar separadamente: e-mail inválido, senha com menos de 8 caracteres, telefone com dígitos incorretos, empresa com CNPJ inválido, e-mail já cadastrado | `400` com mensagem específica em cada caso; e-mail duplicado retorna `409` | **Falhou** (D2, D7) |
| T05 | Localidades | `GET /localidades` | `200`; lista de cidades com bairros, `latitude` e `longitude` | Passou |
| T06 | Listagem e filtros de vagas | `GET /vagas` sem filtros; depois com `q`, `area`, `contrato` e `bairroId`; por fim `bairroId=abc` | Sem filtros: `200` com `total` e `itens` (só vagas `aberta`). Com filtros: apenas vagas correspondentes. `bairroId` inválido: `400` | Passou |
| T07 | Busca por localização | `GET /vagas?lat=..&lng=..&raioKm=..` com raios pequeno e grande; depois `lat=abc` | `200` com `distanciaKm`; vagas fora do raio não aparecem; parâmetros inválidos: `400` | **Falhou** (D1, D37) |
| T08 | Detalhe da vaga | `GET /vagas/{id}` de vaga existente, com e sem token; repetir com id inexistente | `200` com todos os campos do contrato (e `minhaCandidatura` quando houver); inexistente: `404` | Passou |
| T09 | Candidatar-se | `POST /vagas/{id}/candidaturas` com Token C em vaga aberta | `201` com `id`, `vagaId` e `status: "enviada"` | Passou |
| T10 | Restrições da candidatura | Repetir a candidatura; usar Token E; sem token; vaga inexistente; vaga não aberta | Duplicada ou vaga não aberta: `409`. Token E: `403`. Sem token: `401`. Inexistente: `404` | Passou (D30) |
| T11 | Minhas candidaturas | `GET /candidaturas/minhas` com Token C; repetir com Token E | `200` com lista, incluindo a candidatura do T09; Token E: `403` | Passou |
| T12 | Empresa cria e edita vaga | `POST /vagas` com Token E; `PUT /vagas/{id}` mudando salário e status; `POST` inválidos; `POST` com Token C | Válido: `201` (`aberta`) e `200` na edição. Inválidos: `400`. Token C: `403` | Passou (D5, D29) |
| T13 | Painel e candidaturas da empresa | `GET /empresa/vagas` e `GET /empresa/candidaturas` com Token E (com e sem `vagaId` e `status`); repetir com Token C | `200` com listas só da própria empresa e filtros respeitados; Token C: `403` | Passou (D6) |
| T14 | Alterar status da candidatura | `PATCH /candidaturas/{id}/status` com Token E dono; status inválido; outra empresa; id inexistente | `200`, `400`, `403`, `404`; mudança visível em `GET /candidaturas/minhas` | Passou (D31) |
| T15 | Fluxo do candidato no Expo Go | Login, mapa, detalhe da vaga, candidatura e "Minhas candidaturas" | Cada etapa funciona sem erro; credenciais inválidas exibem mensagem | **Falhou** (D4, D10, D15) |

### 5.1 Casos complementares (rodadas 3 e 4)

| ID | Tema | O que foi verificado |
|---|---|---|
| B-A1 a A7 | Banco de dados | Contagens do seed, integridade (FKs, UNIQUE, CHECK, trigger), hashes de senha, login das 14 contas, índices e planos de execução (inclusive massa de 50 mil vagas), reinício do container, backup e restauração |
| B-C1 a C9 | Carga e concorrência | Login, listagens, painel, corridas (candidatura, cadastro, status), mistura sustentada e entradas hostis |
| G01 a G05 | Geolocalização | Raios de 0,5 km, 1 km, 2 km, 10 km (padrão) e 200 km, comparados ao PostGIS; entradas inválidas; fallback pelo bairro do candidato |
| A-T01 a A-T15 | Matriz do Artur (Sprint 5) | Casos que ficaram pendentes no relatório da Sprint 5 (ver seção 10 do relatório) |
| S | Status de vaga e candidatura | Efeito de `pausada`, `encerrada`, `cancelada` e reabertura na busca e na candidatura; ciclo dos 6 status da candidatura |
| P | Permissões | Matriz de 13 rotas por perfil (sem token, candidato, empresa dona, outra empresa) |
| J | Token e cabeçalhos | JWT adulterado, expirado ou com claims anômalas; vazamento de dados; CORS; enumeração de usuário |
| C | Contrato | Campos, tipos, códigos e mensagens de cada endpoint contra `backend/api.md` |

## 6. Rastreabilidade (resumo)

| Área | Casos |
|---|---|
| Autenticação e cadastro | T01–T04, A-T01–A-T05 |
| Localidades e busca de vagas | T05–T08, G01–G05 |
| Candidaturas (candidato) | T09–T11, S |
| Painel da empresa | T12–T14, A-T06–A-T08 |
| Fluxo no aplicativo | T15 |
| Banco de dados | B-A1 a A7 |
| Desempenho e segurança | B-C1 a C9, P, J |
| Contrato da API | C |

## 7. Registro de execução

Os resultados, as evidências e os defeitos estão no [Relatório de Testes](relatorio-de-testes-sprint6.md).

| Rodada | Data | Foco |
|---|---|---|
| 1 | 15/11/2026 | Sem banco; validações e análise estática do app |
| 2 | 15/11/2026 | T01–T14 com banco real e T15 no celular |
| 3 | 15/11/2026 | Banco, regressão, carga e teste rápido no celular |
| 4 | 15/11/2026 | Lacunas: geolocalização, matriz do Artur, status, permissões, token e contrato |

## 8. Pendências

- Reexecutar os casos T04, T07 e T15 e os defeitos D1 a D43 depois das correções (regressão).
- Executar a etapa 6 do T15 (candidatar-se pelo app) quando o detalhe da vaga abrir (D10).
- Executar a coleção Postman e, se possível, torná-la parte da suíte de regressão.
- Definir se o contrato (`api.md`) ou o código muda nos casos em que divergem (D1, D2, D14, D29, D40).
