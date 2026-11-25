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
