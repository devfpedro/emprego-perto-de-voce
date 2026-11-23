# Relatório de Testes — Sprint 7

## 1. Objetivo

Documentar as atividades de implementação e validação dos testes automatizados realizados no backend do projeto Emprego Perto de Você durante a Sprint 7.

O foco desta etapa foi verificar o comportamento da API diante de requisições inválidas, fortalecer as validações dos endpoints e iniciar uma estrutura de testes automatizados.

## 2. Ambiente utilizado

- Linguagem: Python 3.12
- Framework: Flask
- Ferramenta de testes: Pytest 9.2.0
- Ambiente virtual: `.venv`
- Autenticação: JWT

## 3. Estrutura de testes

Foram criados os seguintes arquivos:

- `backend/tests/conftest.py`: configuração das fixtures de aplicação, cliente de testes e autenticação.
- `backend/tests/test_sprint7.py`: implementação dos cenários automatizados.

A aplicação de testes utiliza o cliente de testes do Flask, permitindo executar requisições sem iniciar manualmente o servidor.

Também foi configurada uma chave JWT exclusiva para o ambiente de testes.

## 4. Atividades realizadas

### 4.1. Tratamento de requisições JSON

Foi utilizada a função `obter_json_objeto()` para validar o corpo das requisições.

Foram contemplados:
- Corpo da requisição enviado como texto em vez de JSON.
- JSON malformado.
- JSON cuja estrutura principal não seja um objeto.

As entradas inválidas devem retornar HTTP 400 e uma mensagem de erro em formato JSON.

### 4.2. Validação da atualização de vagas

Foram realizados ajustes nas validações da rota PUT `/vagas/{id}`, incluindo:
- Verificação do tipo do título.
- Validação da descrição e dos requisitos.
- Verificação dos campos obrigatórios.
- Validação dos valores de enumeração.
- Conversão e validação do campo `bairroId`.

### 4.3. Correção na criação de vagas

Foi corrigida uma referência incorreta à variável `turno` na validação dos valores permitidos para o campo.

## 5. Cenários automatizados

Arquivo: `backend/tests/test_sprint7.py`

| Identificação | Cenário | Resultado |
|---|---|---|
| Saúde | Verificação do endpoint `/saude` | Aprovado |
| D3 | Corpo enviado como texto em vez de JSON | Aprovado |
| D21 | JSON com raiz em formato de lista | Aprovado |
| D21 | JSON malformado | Aprovado |
| D5 | Título com tipo inválido no PUT | Aprovado |
| D7 | `bairroId` não numérico no PUT | Aprovado |

## 6. Resultado da execução

Comando utilizado:

```bash
python -m pytest -v
```

Resultado:

```text
collected 6 items

6 passed, 6 warnings
```

**Total: 6 testes aprovados e nenhum teste reprovado.**

Os avisos apresentados durante a execução estão relacionados à utilização de `datetime.utcnow()` e ao tamanho da chave JWT de teste. A chave de teste foi posteriormente substituída por uma chave aleatória de tamanho adequado. O aviso de obsolescência do método de data permanece como ponto de melhoria.

## 7. Considerações finais

A etapa permitiu estabelecer uma estrutura inicial de testes automatizados para o backend e validar seis cenários relacionados ao funcionamento da API e ao tratamento de entradas inválidas.

A cobertura ainda é parcial. Os demais cenários previstos no planejamento da Sprint 7 deverão ser implementados e validados nas próximas etapas.