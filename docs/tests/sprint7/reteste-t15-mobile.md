# Registro de Reteste T15 — Sprint 7

## Escopo

Retestar no Expo Go o fluxo principal do candidato após a integração P0: login, mapa, detalhes da vaga e candidatura. O registro cobre somente o T15.

## Identificação da execução

- **Responsável:** Erick Felipe
- **Data:** 23/11/2026
- **Branch:** `test/integracao-sprint7`
- **Commit testado:** Pendente
- **Dispositivo / Expo Go:** Android / Expo Go
- **Integração P0 concluída:** Pendente

## Casos do T15

| Etapa | Ação | Resultado esperado | Resultado | Evidência / observações |
|---|---|---|---|---|
| 1 | Entrar com uma conta de candidato já cadastrada | Login aceito e navegação para o mapa, sem retornar à tela de login | Aprovado | Backend registrou `POST /auth/login` com HTTP 200; o app permaneceu no mapa conforme captura de tela |
| 2 | Aguardar o mapa carregar | Mapa exibido com as vagas disponíveis na região | Aprovado | Captura de tela mostra mapa, marcadores e vaga selecionada; backend respondeu HTTP 200 às duas consultas `GET /vagas` |
| 3 | Selecionar uma vaga e abrir seus detalhes | Tela de detalhes abre e exibe os dados da vaga selecionada | Aprovado | As capturas mostram que a tela de detalhes abriu; o backend respondeu `GET /vagas/1` com HTTP 200 |
| 4 | Tocar em “Candidatar-me” | Candidatura é enviada e o app apresenta confirmação | Aprovado | A tela mostrou o status “Enviada” e “Candidatura Enviada”; backend respondeu `POST /vagas/4/candidaturas` com HTTP 201 |
| 5 | Abrir “Minhas candidaturas” | As duas candidaturas esperadas aparecem na lista com seus status | Falhou | A captura mostra “1 candidatura acompanhada” e apenas um cartão, embora haja duas candidaturas esperadas. A candidatura recém-enviada, confirmada anteriormente com HTTP 201, não aparece na lista. |

## Resultado da execução

- **Resultado geral do T15:** Falhou parcialmente
- **Falhas encontradas:** A candidatura recém-enviada não aparece em “Minhas candidaturas” (a tela mostra uma de duas esperadas)
- **Evidências anexadas:** Capturas enviadas pelo usuário em 23/11/2026; logs do Expo e backend compartilhados nesta conversa
- **Observações finais:** O Expo informou que não encontrou `./assets/images/icon.png`, mas concluiu o bundle e o app exibiu o mapa. O aviso não impediu estas etapas.

## Resultado final (commit c970b60, 25/11/2026)

Reteste direcionado no commit `c970b60` (branch `feat/docs-sprint7`), em Android físico (Samsung SM-A155M, Expo Go 58.0.6) via USB. Antes do app: `pytest` com 6 testes aprovados e `tsc --noEmit` sem erros.

### Reteste direcionado

| Passo | Verificação | Resultado | Evidência / observações |
|---|---|---|---|
| 1 | Metro não exibe mais o aviso de `initialRouteName` obsoleto | OK | Log do Metro sem menção a `initialRouteName` nem `unstable_settings`; resta apenas o aviso de `SafeAreaView` obsoleto |
| 2 | Login como candidato leva à aba Mapa | OK | `POST /auth/login` 200 e `GET /vagas?raioKm=10` 200; mapa exibido com as abas Mapa, Candidaturas e Perfil |
| 3 | Etapa 3 do T15: "Detalhar vaga" abre os detalhes e voltar mantém o mapa | OK | `GET /vagas/21` 200; ao voltar, mesmo processo e nenhum novo `GET /vagas`, com a vaga selecionada mantida |
| 4 | Candidatar-se e ver em "Minhas candidaturas" sem reiniciar o app | OK | `POST /vagas/21/candidaturas` 201; `GET /candidaturas/minhas` 200 com 3 itens, o novo "Enviada em 25/11/2026"; candidatura id 18 no banco |
| 5 | Extra 9a: cadastro de candidato sem WhatsApp | OK | `POST /auth/cadastro` 201, login automático 200 e mapa; usuário id 18 com `whatsapp IS NULL` |
| 6 | Extra 9b: cadastro de candidato com WhatsApp | OK | Digitado "83 99999-0000": 201, login 200 e mapa; usuário id 19 com WhatsApp `83999990000` (só dígitos) |
| 7 | Login de empresa cai na área da empresa | OK | `POST /auth/login` 200 e `GET /empresa/vagas` 200, sem passar pelo mapa; painel com 4 vagas |

### Commits aplicados após o primeiro reteste

| Commit | Alteração |
|---|---|
| `c1818c6` | Uso de `unstable_settings.anchor` no `(candidato)/_layout.tsx`, no lugar de `initialRouteName` obsoleto |
| `6f32294` | WhatsApp vazio enviado como `null` no cadastro de candidato |
| `c970b60` | Rota tipada do mapa atualizada no login, após mover as telas para `(tabs)` |

### Pendências para a Sprint 8

| # | Pendência | Observação |
|---|---|---|
| 1 | Botões sob a barra de navegação do Android | "Candidatar-me a esta vaga" e "Ver em Minhas Candidaturas" ficam parcialmente cobertos pela barra de 3 botões |
| 2 | Perfil do candidato exibe "Não informado" | Telefone, área de interesse e região aparecem como "Não informado", mesmo com os dados gravados no banco |
| 3 | Botão "Nova Vaga" sobre a barra de status | Cabeçalho do painel da empresa sobrepõe a barra de status |
| 4 | 403 visível ao abrir rota de empresa como candidato | A tela monta, chama `GET /empresa/vagas` (403) e mostra o toast "ApiError: Acesso negado." antes do redirecionamento |
| 5 | Botão "Sair" depende de rolagem | `marginTop: 180` em `perfil.tsx` deixa o botão fora da primeira tela |
| 6 | `icon.png` ausente no `app.json` | O Metro avisa `Unable to resolve asset "./assets/images/icon.png"` |
| 7 | Aba "Candidatos" e painel da empresa com 404 | O app chama `/empresas/candidaturas` e `/empresas/vagas`, mas o backend expõe `/empresa/...` |
| 8 | Backend grava WhatsApp `""` | Normalizar para `None` no backend, a cargo do Artur; hoje a correção existe apenas no app |

### Conclusão

**T15 aprovado** no commit `c970b60`: login, mapa, detalhes da vaga, candidatura e atualização de "Minhas candidaturas" funcionam sem reiniciar o app, e os extras de cadastro e login de empresa passaram. As pendências acima não bloqueiam o T15 e seguem para a Sprint 8.
