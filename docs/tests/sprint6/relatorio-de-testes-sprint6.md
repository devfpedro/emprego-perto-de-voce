# Relatório de Testes - Sprint 6 - Emprego Perto de Você

**Equipe:** Iteravise · **Sprint:** 6 (09–13/11/2026, entrega em 16/11/2026) · **Responsável pelos testes e documentação:** Pedro Henrique
**Versão:** 1.0 · **Data:** 15/11/2026 · **Plano de referência:** [`plano-de-testes-sprint6.md`](plano-de-testes-sprint6.md) (v0.2)

> Este documento reúne os resultados dos testes feitos em 15/11/2026 sobre o código integrado da sprint (back-end, front-end e banco de dados), em quatro rodadas.

## 1. Resumo executivo

- **API:** os 14 casos do plano (T01–T14) foram executados com banco real. **12 passam e 2 falham** (T04: mensagem de CNPJ inválido diferente do contrato; T07: parâmetros de geolocalização inválidos não retornam `400`). O fluxo principal da API (cadastro, login, busca de vagas por localização, candidatura, painel da empresa e mudança de status) funciona.
- **Banco de dados:** aprovado. Schema, seed, 27 constraints, 18 índices, PostGIS, reinício, backup e restauração conferidos. Um achado: os 14 usuários do seed compartilham o mesmo hash de senha (D20).
- **Permissões e segurança:** nenhuma das 57 verificações de permissão por perfil vazou dados entre empresas ou candidatos; nenhum token forjado, adulterado ou expirado foi aceito.
- **Desempenho:** leituras entre 190 e 270 requisições/s (p99 abaixo de 190 ms); login limitado a ~45 requisições/s por causa do `scrypt`. As corridas de candidatura, cadastro e atualização de status ficaram consistentes. Em carga contínua muito alta a API satura (D23).
- **Aplicativo (Expo Go, celular Android):** **T15 falhou.** Só o login (válido e inválido) e "Minhas candidaturas" funcionam; mapa, detalhe da vaga, perfil, cadastro de candidato e telas da empresa têm defeitos graves de integração com a API.
- **Defeitos:** **43 registrados (D1–D43), todos abertos** nesta data: 3 de gravidade alta, 21 média, 15 baixa e 4 informativos. Os de gravidade alta estão no aplicativo.
- **Recomendação:** o back-end está pronto para integração. O gargalo para a demonstração é o front-end (D10, D4, D15).

## 2. Objetivo e escopo

Verificar se a API e o fluxo principal do aplicativo funcionam conforme o contrato (`backend/api.md`) e os requisitos do projeto, registrar evidências e listar os defeitos para correção.

**Dentro do escopo:** API REST (autenticação, localidades, vagas, candidaturas, painel da empresa), banco de dados (integridade, índices, backup), desempenho e concorrência da API, permissões e segurança básica do token, fluxo do candidato no aplicativo.

**Fora do escopo:** HTTPS e infraestrutura de produção, upload de currículo (não há rota), paginação (não existe), acessibilidade, testes automatizados no repositório (não existem).

## 3. Ambiente e versões testadas

| Item | Detalhe |
|---|---|
| Código testado | Branch local `test/integracao-sprint6`: `main` (`509bcb7`) + back-end (`36c6898`, `d2e3d24`) + front-end (até `6f72721`) + banco (`c434433`, SCRUM-56, somente `database/README.md`) |
| Back-end | Flask 3.1.3, Werkzeug 3.1.9 (servidor de desenvolvimento), Python 3.14.7, `http://127.0.0.1:8000` |
| Banco | PostgreSQL 17.5 + PostGIS 3.5.2 em Docker (`postgis/postgis:17-3.5`, container `emprego-perto-db`, porta 5433), populado por `schema.sql` e `seed.sql` |
| Aplicativo | React Native + Expo SDK 58 (Expo Go), celular Samsung SM-A155M por USB, API acessada com `adb reverse` |
| Contas de teste | 14 do seed (8 candidatos, 6 empresas), senha `Teste@1234`; todos os dados são fictícios |
| Máquina | Windows, Docker Desktop, Node v24.19.0 |

O código do back-end e do front-end não mudou entre as rodadas 2, 3 e 4, então os resultados abaixo se referem à mesma versão do sistema.

## 4. Método

As requisições à API foram feitas com scripts em Python (biblioteca `requests`) e o banco foi consultado com SQL. As etapas do aplicativo foram feitas à mão, no celular, com o Expo Go. A rodada 1 foi feita sem banco; as demais usaram o banco real. As vagas e os usuários do seed não foram alterados: os testes que modificam dados usaram registros criados durante os próprios testes, e o seed foi conferido por `md5` antes e depois da rodada 4.

| Rodada | Foco | Resultado |
|---|---|---|
| 1 | Validações que não dependem do banco, análise estática do app | Sem Docker/WSL no ambiente: 40 sub-passos bloqueados; encontrados D1–D12 |
| 2 | T01–T14 com banco real e T15 no celular | API: 102 passou, 5 falhou, 11 observações; app: T15 falhou; D13–D19 |
| 3 | Banco, regressão, carga/concorrência e teste rápido no celular | Banco aprovado; mesma regressão; D20–D27 |
| 4 | Lacunas: geolocalização, matriz do Artur, status, permissões, token, contrato | 183 passou, 16 falhou, 23 observações, contrato com 5 divergências em 134 itens; D28–D43 |

## 5. Resultados por caso de teste (T01–T15)

| ID | Caso | R1 | R2 | R3 | Resultado final | Observação |
|---|---|---|---|---|---|---|
| T01 | Login válido | Bloqueado | Passou | Passou | **Passou** | `200` com `token`, `perfil`, `usuario` |
| T02 | Login inválido | Parcial | Passou | Passou | **Passou** | `401` nos três casos; corpo não JSON devolve HTML (D3) |
| T03 | Cadastro de candidato | Bloqueado | Passou | Passou | **Passou** | `201` e login com a conta nova |
| T04 | Validações do cadastro | Falhou | Falhou | Falhou | **Falhou** | CNPJ inválido: mensagem diferente do contrato (D2); `bairroId` não numérico dá `500` (D7) |
| T05 | Localidades | Bloqueado | Passou | Passou | **Passou** | 2 cidades, 12 bairros |
| T06 | Listagem e filtros | Parcial | Passou | Passou | **Passou** | Só vagas abertas; filtros e combinações corretos |
| T07 | Busca por localização | Falhou | Falhou | Falhou | **Falhou** | Distâncias e raios corretos; `lat`/`lng`/`raioKm` inválidos retornam `200` (D1, D37) |
| T08 | Detalhe da vaga | Bloqueado | Passou | Passou | **Passou** | Campos do contrato e `minhaCandidatura` |
| T09 | Candidatar-se | Bloqueado | Passou | Passou | **Passou** | `201` `enviada` |
| T10 | Restrições da candidatura | Parcial | Passou | Passou | **Passou** | `409`/`403`/`401`/`404` corretos; mesma mensagem para dois motivos de `409` (D30) |
| T11 | Minhas candidaturas | Parcial | Passou | Passou | **Passou** | |
| T12 | Empresa cria e edita vaga | Parcial | Passou | Passou | **Passou** | `PUT` com título numérico dá `500` (D5); `PUT` sem salário zera o salário (D29) |
| T13 | Painel e candidaturas da empresa | Parcial | Passou | Passou | **Passou** | Isolamento por empresa confirmado; filtros inválidos ignorados (D6) |
| T14 | Alterar status da candidatura | Parcial | Passou | Passou | **Passou** | `200`/`400`/`403`/`404`; mudança visível ao candidato; sem regra de transição (D31) |
| T15 | Fluxo do candidato no Expo Go | Bloqueado | Falhou | Falhou (teste rápido) | **Falhou** | Ver seção 9 |

Totais da regressão da API (rodadas 2 e 3, idênticos): 102 passou, 5 falhou, 11 observações (extras fora do plano).

## 6. Banco de dados (rodada 3)

| Verificação | Resultado |
|---|---|
| Contagens do seed: 14 usuários (8 candidatos + 6 empresas), 2 cidades, 12 bairros, 24 vagas, 16 candidaturas | Passou |
| Schema, seed e `docker-compose.yml` iguais ao container em execução; 27 constraints, 3 funções e 4 triggers presentes | Passou |
| Integridade (e-mail e CNPJ únicos, FKs, CHECKs, trigger de perfil, CNPJ com dígito verificador, latitude fora da faixa), testada com `ROLLBACK` | Passou: 14 inserções/alterações inválidas rejeitadas pelo banco e dados intactos depois |
| PostGIS 3.5.2 e índice GiST de localização dos bairros | Passou (o índice não é usado pela API, que calcula Haversine em Python) |
| Hashes de senha: algoritmo `scrypt`, nenhum em texto claro | Passou |
| Hashes de senha do seed: salt único por usuário | **Falhou** (os 14 hashes são iguais, D20) |
| Login das 14 contas com `Teste@1234` (`200`) e com senha errada (`401`) | Passou (14/14 e 14/14) |
| Índices e `EXPLAIN ANALYZE` em massa de 50 mil vagas (esquema temporário, removido) | Passou: o planejador usa os índices de `vagas` e `candidaturas` com a massa grande; no seed pequeno usa varredura sequencial (esperado) |
| Reinício do container: dados idênticos (md5) e seed não reexecutado | Passou |
| Backup e restauração (procedimento do README do SCRUM-56) em banco separado | Passou; comandos funcionam como escritos, desde que `docker` esteja no PATH |
| Consistência após a carga (sem duplicatas, órfãos ou conexões abertas) | Passou |

## 7. Desempenho e concorrência (rodada 3)

Flask em modo de desenvolvimento, 1 processo, Windows com Docker Desktop.

| Cenário | Requisições / concorrência | Sucesso | p50 | p99 | Taxa |
|---|---|---|---|---|---|
| Login válido (14 contas) | 700 / 20 | 100% | 403 ms | 770 ms | 45 req/s |
| Login com senha errada | 200 / 20 | 100% (`401`) | 400 ms | 604 ms | 48 req/s |
| `GET /vagas` (5 variações, com geolocalização) | 500 cada / 30 | 100% | 108–122 ms | 138–154 ms | 240–270 req/s |
| Candidaturas, painel da empresa | 300 cada / 30 | 100% | 118–151 ms | 143–190 ms | 190–246 req/s |
| Entradas hostis (corpo vazio, ids gigantes, SQL injection, 1 MB) | 40–100 cada / 10–20 | 4xx controlado, exceto D21 e D22 | - | - | - |
| Mistura por 60 s, com intervalo entre requisições | 3.905 / 30 | 100% | 33 ms | 279 ms | 65 req/s |
| Mistura por 60 s, sem intervalo (saturação) | 46.431 / 30 | 8% | 24 ms | 401 ms | 774 req/s |

**Corridas (concorrência):** 30 candidaturas simultâneas do mesmo candidato na mesma vaga resultaram em 1×`201` e 29×`409`, com uma linha no banco; 20 cadastros simultâneos com o mesmo e-mail resultaram em 1×`201` e 19×`409`; 20 mudanças simultâneas de status ficaram consistentes. A restrição `UNIQUE` do banco garante a integridade.

**Limite observado:** em carga contínua muito alta (~1.000 req/s) a máquina esgotou as portas efêmeras em cerca de 20 s (clientes receberam erros de conexão e a API devolveu 439 respostas `500`), e se recuperou sozinha. A causa provável é a ausência de pool de conexões e de keep-alive (D23); não foi isolada por prova direta. Nenhuma conexão ficou aberta no banco depois dos testes.

## 8. Permissões e segurança (rodada 4)

- **Matriz de permissões (13 rotas × sem token, candidato, empresa dona, outra empresa):** 57 verificações passaram. Empresa de outra empresa não lê, não edita e não vê dados alheios (`PUT` e `PATCH` negados com `403` e recurso inalterado no banco); candidato não vê candidaturas de outro.
- **Token JWT:** 41 verificações. Token ausente, truncado, com assinatura alterada, `alg=none`, `HS512`, expirado, `nbf` futuro ou com perfil adulterado: sempre `401`. Tokens com claims anômalas assinados com o segredo do ambiente de teste revelaram fragilidades do parser (D38), exploráveis apenas por quem tem o segredo.
- **Respostas:** nenhuma contém `senha` ou hash; erros `404`/`405`/`415`/`500` não expõem rastros de pilha ou caminhos, mas são páginas HTML.
- **Pontos de atenção:** CORS aceita qualquer origem (D32); cabeçalho `Server` revela versões (D33); o tempo de resposta do login revela se o e-mail existe (146,8 ms contra 29,0 ms, D34); sem limite de tentativas de login (D24).

## 9. Aplicativo (T15, celular Android)

Rodada 2 (etapas 1 a 9) e rodada 3 (teste rápido nas etapas 1, 2, 3, 5 e 8 mais o D15), com o mesmo resultado.

| Etapa | Resultado | Defeito |
|---|---|---|
| 1 Login inválido | Passou | - |
| 2 Login válido, entrada no mapa | Passou | D13 (token impresso no log do aparelho) |
| 3 Perfil com dados reais | **Falhou** (mostra dados fixos "Pedro Henrique") | D4 |
| 4 Mapa (empresas, categorias, busca) | **Falhou** (pins sobrepostos, filtro esvazia o mapa, busca por texto sem resultado derruba o app) | D10, D15 |
| 5 "Ver vagas e detalhes" | **Falhou** (não abre a tela) | D10 |
| 6 Candidatar-se pelo app | **Bloqueado** (consequência da etapa 5); candidatura validada pela API | D10 |
| 7 Minhas candidaturas | Passou | D14 (formato da data) |
| 8 Cadastro de candidato | **Falhou** (mostra sucesso e não chama a API) | D10 |
| 9 Cadastro de empresa e telas da empresa | **Falhou** (rotas inexistentes, sem guarda por perfil) | D10, D11, D17 |

Por leitura de código (sem celular): o texto "A combinar" para salário vazio está implementado; o app **não usa GPS** (busca por proximidade depende do bairro cadastrado, D41); as abas "Em andamento" e "Encerradas" filtram no cliente, porque a API não tem filtro de status em `GET /candidaturas/minhas` (D40). Não há logout (D16).

## 10. Cobertura da matriz do Artur (Sprint 5)

O relatório de QA da Sprint 5 ([`../sprint5/relatorio_consolidado_qa_emprego_perto_de_voce_semana_09_a_13_nov_2026.pdf`](../sprint5/relatorio_consolidado_qa_emprego_perto_de_voce_semana_09_a_13_nov_2026.pdf)) deixou vários casos como pendentes. Todos foram cobertos nesta sprint (rodada 4, bloco indicado):

| Caso do Artur | Cobertura nesta sprint | Resultado |
|---|---|---|
| T01 cadastro sem WhatsApp | Passou; porém WhatsApp vazio ou com máscara retorna `400` genérico (D35) | Passou com ressalva |
| T02 senha com 7 caracteres | Passou; a única regra é ter 8 ou mais caracteres (D39) | Passou |
| T03 telefone com 9 dígitos | Passou; letras no fim do número são descartadas e o cadastro é aceito (D36) | Passou com ressalva |
| T04 e-mail inválido | Passou; e-mail de 300 caracteres dá `500` (D28) | Passou com ressalva |
| T05 CNPJ inválido e duplicidades | Passou (mensagem diferente do contrato, D2) | Passou |
| T06 salário texto no `POST /vagas` | Passou | Passou |
| T07 salário texto no `PUT /vagas/{id}` | Passou (`400`, vaga inalterada) | Passou |
| T08 salário nulo no `PUT` | Nulo persiste; omitir o campo também zera o salário (D29) | Passou com ressalva |
| T09 candidatura duplicada e `409` | Passou; mesma mensagem para dois motivos (D30) | Passou com ressalva |
| T10 vaga pausada, encerrada, cancelada | Passou (some da busca, `409` ao candidatar, candidaturas existentes permanecem) | Passou |
| T11 vaga não aberta some da busca | Passou | Passou |
| T12 permissões `403` | Passou na matriz completa (57 verificações) | Passou |
| T13 status atualizado em "Minhas candidaturas" | Passou nos 6 status; sem regra de transição (D31) | Passou com ressalva |
| T14 filtros "Em andamento" e "Encerradas" | Filtro não existe na API; app filtra no cliente (D40) | Observação |
| T15 GPS e salário vazio | "A combinar" implementado; GPS não implementado (D41) | Falhou (GPS) |
| Geolocalização G01–G03 (1 km, 0,5 km, 2 km) | Passaram e conferem com o PostGIS (diferença máxima de 0,010 km) | Passou |

## 11. Conformidade com o contrato da API

134 verificações de campos, tipos, códigos e mensagens contra `backend/api.md`: **129 OK e 5 divergências**: mensagem de CNPJ inválido (D2), formato das datas em três rotas (D14) e `distanciaKm` de `GET /empresas/{id}` sem coordenadas, que o contrato não define (D42).

## 12. Defeitos

Situação de todos: **aberto** em 15/11/2026. "Quem" indica a área responsável pela correção.

### 12.1 Resumo

| Gravidade | Quantidade | Defeitos |
|---|---|---|
| Alta | 3 | D4, D10, D15 |
| Média | 21 | D1, D3, D5, D11, D13, D16, D17, D20, D21, D22, D23, D24, D28, D29, D30, D31, D32, D34, D35, D37, D41 |
| Baixa | 15 | D2, D6, D7, D8, D12, D14, D18, D19, D25, D26, D33, D36, D38, D39, D42 |
| Informativa | 4 | D9, D27, D40, D43 |

Por área: front-end 9 (D4, D10, D11, D13, D15, D16, D17, D19, D41), back-end 30, banco de dados 2 (D20, D27), documentação 2 (D26, D42); vários defeitos do back-end também exigem ajuste na documentação (`api.md`).

### 12.2 Lista

| ID | Gravidade | Onde | Descrição | Quem |
|---|---|---|---|---|
| D1 | Média | `GET /vagas` | `lat`, `lng` e `raioKm` inválidos (`abc`, `91`, `-1`, vírgula) retornam `200` e são ignorados | back |
| D2 | Baixa | `POST /auth/cadastro` | Mensagem de CNPJ inválido difere do contrato | back/docs |
| D3 | Média | Rotas com corpo | Corpo não JSON ou malformado retorna `415`/`400` em HTML, não `{erro}` | back |
| D4 | Alta | App: login e perfil | App ignora o `usuario` do login e mostra dados fixos no perfil | front |
| D5 | Média | `PUT /vagas/{id}` | Tipos errados (título numérico) dão `500` em HTML; `PUT` exige corpo completo | back |
| D6 | Baixa | `GET /empresa/candidaturas` | `vagaId=abc` ignorado; `status=xyz` devolve lista vazia sem `400` | back |
| D7 | Baixa | `POST /auth/cadastro` | `bairroId` não numérico dá `500` (bairro inexistente dá `400`, correto) | back |
| D8 | Baixa | `POST /vagas` | Mensagem genérica para enum inválido (não diz o campo) | back |
| D9 | Informativa | Rotas protegidas | Mensagens de `403` variam ("Acesso negado." e outras) | back/docs |
| D10 | Alta | App (várias telas) | Cadastro de candidato não chama a API; mapa usa `/empresas` com campos inexistentes; botão de detalhe não abre tela; telas da empresa chamam rotas inexistentes | front |
| D11 | Média | `mobile/package-lock.json` | Lock fora de sincronia com `package.json` (`npm ci` falha) | front |
| D12 | Baixa | `backend/requirements.txt` | Arquivo em UTF-16 | back |
| D13 | Média | App: `login.tsx` | Imprime o JWT completo no log do aparelho | front |
| D14 | Baixa | Datas da API | Sem fuso e com microssegundos (`2026-11-15T18:10:36.553105`); contrato prevê `...000Z` | back/docs |
| D15 | Alta | App: `mapa.tsx` | Busca com texto sem resultado derruba o app (`toLowerCase` de `undefined`) | front |
| D16 | Média | App | Barra de navegação dupla, cabeçalho duplicado, sem botão de sair | front |
| D17 | Média | App: roteamento | Sem guarda por perfil: candidato abre telas da empresa | front |
| D18 | Baixa | `GET /vagas` | Candidato logado sem coordenadas recebe filtro implícito de 10 km pelo bairro do cadastro (não documentado) | back/docs |
| D19 | Baixa | Ferramentas do app | Ícone inexistente em `app.json`, script `reset-project` sem arquivo, erro de `tsc`, sem scripts de teste ou ESLint | front |
| D20 | Média | `database/seed.sql` | Os 14 usuários do seed têm o mesmo hash de senha (mesmo salt) | banco |
| D21 | Média | Rotas com `get_json()` | Corpo JSON que não é objeto (`[1,2,3]`) dá `500` | back |
| D22 | Média | `POST /auth/cadastro`, `POST /vagas` | Texto maior que a coluna (1 MB) dá `500`; sem limite de tamanho do corpo | back |
| D23 | Média | `app/db.py`, servidor | Sem pool de conexões nem keep-alive; servidor de desenvolvimento; satura em carga contínua alta | back/infra |
| D24 | Média | `POST /auth/login` | Sem limite de tentativas: força bruta e consumo de CPU pelo `scrypt` | back |
| D25 | Baixa | `run.py` | Escuta só em IPv4; `localhost` no Windows é lento | back/docs |
| D26 | Baixa | `database/README.md` | `*.backup` fora do `.gitignore`; restauração documentada usa `--clean` no banco principal; exige `docker` no PATH | docs |
| D27 | Informativa | `schema.sql`, `indexes.sql` | `indexes.sql` só tem o cabeçalho; índice GiST dos bairros não é usado | banco |
| D28 | Média | `POST /auth/cadastro` | E-mail de 300 caracteres dá `500` | back |
| D29 | Média | `PUT /vagas/{id}` | `PUT` sem `salario` sobrescreve o salário com nulo | back/docs |
| D30 | Média | `POST /vagas/{id}/candidaturas` | Mesma mensagem `409` para "já se candidatou" e "vaga não aberta" | back |
| D31 | Média | `PATCH /candidaturas/{id}/status` | Sem regra de transição: qualquer status vai para qualquer status | back |
| D32 | Média | CORS | Aceita qualquer origem | back |
| D33 | Baixa | Cabeçalho `Server` | Expõe versões do Werkzeug e do Python | back/infra |
| D34 | Média | `POST /auth/login` | Tempo de resposta revela se o e-mail existe (5×) | back |
| D35 | Média | `POST /auth/cadastro` | `whatsapp` vazio ou com máscara dá `400` genérico | back |
| D36 | Baixa | `POST /auth/cadastro` | Letras no fim do telefone são descartadas e o cadastro é aceito | back |
| D37 | Média | `GET /vagas` | `lat=inf` dá `500`; `lat=nan` devolve `distanciaKm: NaN` (JSON inválido) | back |
| D38 | Baixa | Parser de claims do token | Token sem `perfil` ou com `id` não numérico dá `500`; token sem `exp` ou de usuário inexistente é aceito (só com o segredo) | back |
| D39 | Baixa | Regra de senha | Aceita `12345678`, `abcdefgh` e 8 espaços | back/docs |
| D40 | Informativa | `GET /candidaturas/minhas` | Sem filtro de status (o app filtra no cliente) | docs/back |
| D41 | Média | App: mapa | Não usa GPS (`expo-location` ausente); botão de localização só alterna uma flag | front |
| D42 | Baixa | `api.md` | `distanciaKm` sem coordenadas, `404` de empresa e `PUT` completo não documentados | docs |
| D43 | Informativa | `PUT`/`PATCH` | `403` e `404` permitem descobrir ids existentes | back |

## 13. Riscos e recomendações

1. **Demonstração do aplicativo:** resolver primeiro D10 (cadastro, mapa, detalhe, telas da empresa), D4 (perfil) e D15 (queda na busca). Sem isso o fluxo principal (buscar vaga e se candidatar) não pode ser demonstrado pelo app, embora funcione pela API.
2. **Contrato da API:** decidir se o contrato ou o código muda em D1, D2, D14, D29 e D40, e atualizar `api.md`.
3. **Segurança antes de publicar:** D24 (limite de tentativas), D32 (CORS), D34, D38 e D13 (token no log).
4. **Robustez:** tratar entradas inválidas (D1, D3, D5, D21, D22, D28, D37) para que nunca respondam `500`.
5. **Publicação:** usar servidor de produção com pool de conexões (D23) e HTTPS.
6. **Banco:** gerar hashes individuais no seed (D20) e ajustar `.gitignore` para `*.backup` (D26).
7. **Qualidade contínua:** não há testes automatizados no repositório. A coleção Postman em [`postman/`](postman/) pode ser a base de uma suíte de regressão.
8. **Reteste:** após as correções, repetir os casos T01–T15 e os defeitos da lista (a coleção Postman cobre os principais) e as etapas 1 a 9 do T15 no celular; a etapa 6 (candidatar-se pelo app) só poderá ser executada depois da correção do D10.

## 14. Limitações

- T15: a etapa 6 (candidatar-se pelo app) ficou bloqueada pelo D10; o cadastro de empresa e a mudança de status pelo app foram avaliados apenas por leitura de código; o envio de currículo em PDF não foi testado (não há rota). Na rodada 3, D11, D16 e D17 não foram reexecutados porque o código era idêntico ao da rodada 2.
- A coleção Postman foi gerada e validada (JSON e esquema), mas não foi executada no Postman; os mesmos casos foram executados pelos scripts em Python.
- O limite de desempenho foi medido em uma única máquina Windows com servidor de desenvolvimento; a causa do colapso em carga alta não foi isolada por prova direta.
- Não testados: mais de 100 conexões simultâneas ao banco, volumes de milhões de linhas, upload de currículo, TLS e rate limiting em produção.
- O banco de teste acumulou dados fictícios (`rodada3_*@teste.com`, `rodada4_*@teste.com` e contas de teste anteriores), sem afetar as 24 vagas e os 14 usuários do seed.
- As evidências brutas (logs, capturas de tela, planos de execução e scripts) estão guardadas localmente e não fazem parte do repositório.

## 15. Documentos relacionados

| Documento | Local |
|---|---|
| Plano de testes (v0.2) | [`plano-de-testes-sprint6.md`](plano-de-testes-sprint6.md) |
| Coleção e ambiente Postman | [`postman/`](postman/) |
| Relatório de QA da Sprint 5 (Artur) | [`../sprint5/`](../sprint5/) |
| Fluxo de telas | `mobile/docs/telas-e-fluxos/diagram/fluxo-de-telas.png` |
| Contrato da API | `backend/api.md` |
