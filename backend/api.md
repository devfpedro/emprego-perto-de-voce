
# Contrato de API — Emprego Perto de Você (Semana 1)

Especificação técnica das rotas REST, payloads, validações, respostas e **mapeamento de telas** do MVP da plataforma **Emprego Perto de Você**.

## 📄 1. Convenções Gerais

- **Formato de Dados:** Todos os corpos de requisição e resposta utilizam `application/json`.
- **Códigos/Enums:** Valores de enums devem ser enviados e retornados estritamente em **letras minúsculas e sem acentuação**.
- **Autenticação:** As rotas protegidas exigem o cabeçalho `Authorization: Bearer <TOKEN_JWT>`.
- **Erros de Validação (HTTP 400):** 
  ```json
  { "erro": "Descrição detalhada da falha." }

```

* **Conflitos/Duplicidades (HTTP 409):**
```json
{ "erro": "Recurso, e-mail ou CNPJ já cadastrado." }

```



---

## 🗂️ 2. Domínios e Listas Fechadas (Enums)

| Domínio | Valores Aceitos no JSON |
| --- | --- |
| **Perfil** | `candidato`, `empresa` |
| **Área de Atuação** | `alimentacao`, `comercio`, `saude`, `servicos_gerais`, `educacao` |
| **Tipo de Contrato** | `clt`, `meio_periodo`, `temporario`, `estagio` |
| **Regime de Trabalho** | `presencial`, `hibrido`, `remoto` |
| **Turno de Trabalho** | `integral`, `manha`, `tarde`, `noturno` |
| **Status da Vaga** | `aberta`, `pausada`, `encerrada`, `cancelada` |
| **Status da Candidatura** | `enviada`, `em_analise`, `curriculo_visto`, `entrevista`, `encerrada`, `rejeitada` |

---

## 🔑 3. Autenticação & Geral

### `POST /auth/cadastro`

Cria uma nova conta de usuário (Candidato ou Empresa).

* **Tela Utilizadora:** `Autenticação / CadastroCandidato` ou `Autenticação / CadastroEmpresa`
* **Headers:** `Content-Type: application/json`
* **Body (Perfil Candidato):**
```json
{
  "perfil": "candidato",
  "nome": "Juan Nicolas",
  "email": "juan@exemplo.com",
  "senha": "senhaSegura123",
  "telefone": "83988887777",
  "whatsapp": "83988887777",
  "areaInteresse": "servicos_gerais",
  "cidadeId": 1,
  "bairroId": 10
}

```


* **Body (Perfil Empresa):**
```json
{
  "perfil": "empresa",
  "nome": "Padaria Guarabira Ltda",
  "cnpj": "12345678000195",
  "email": "contato@padaria.com",
  "senha": "senhaSegura123",
  "telefone": "8332710000",
  "descricao": "Padaria e confeitaria tradicional.",
  "setor": "alimentacao",
  "site": "[https://padariaguarabira.com.br](https://padariaguarabira.com.br)",
  "cidadeId": 1,
  "bairroId": 10
}

```


* **Respostas:**
* `201 Created`: `{ "mensagem": "Usuário cadastrado com sucesso", "id": 1 }`
* `400 Bad Request`: `{ "erro": "CNPJ deve conter 14 dígitos válidos." }`
* `409 Conflict`: `{ "erro": "Este e-mail ou CNPJ já está em uso." }`



---

### `POST /auth/login`

Autentica o usuário e retorna o token JWT.

* **Tela Utilizadora:** `Autenticação / Login`
* **Body:**
```json
{
  "email": "juan@exemplo.com",
  "senha": "senhaSegura123"
}

```


* **Respostas:**
* `200 OK`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "perfil": "candidato",
  "usuario": {
    "id": 1,
    "nome": "Juan Nicolas",
    "email": "juan@exemplo.com"
  }
}

```


* `401 Unauthorized`: `{ "erro": "E-mail ou senha inválidos." }`



---

### `GET /localidades`

Retorna as cidades e seus respectivos bairros com coordenadas geográficas.

* **Tela Utilizadora:** `Autenticação / CadastroCandidato`, `Autenticação / CadastroEmpresa` e `Empresa / CriarVaga`
* **Respostas:**
* `200 OK`:
```json
[
  {
    "id": 1,
    "nome": "Guarabira",
    "bairros": [
      {
        "id": 10,
        "nome": "Centro",
        "latitude": -6.8551,
        "longitude": -35.4912
      }
    ]
  }
]

```





---

## 💼 4. Rotas do Candidato & Públicas

### `GET /vagas`

Lista vagas ativas (`aberta`) com cálculo de distância por Haversine.

* **Tela Utilizadora:** `Candidato / MapaInicial` e `Candidato / ModalFiltros`
* **Query Params:** `q`, `area`, `contrato`, `bairroId`, `lat`, `lng`, `raioKm`
* **Respostas:**
* `200 OK`:
```json
{
  "total": 1,
  "itens": [
    {
      "id": 12,
      "titulo": "Atendente de Balcão",
      "area": "alimentacao",
      "contrato": "clt",
      "empresa": { "id": 4, "nome": "Padaria Guarabira Ltda" },
      "bairro": { "id": 10, "nome": "Centro" },
      "distanciaKm": 1.4
    }
  ]
}

```





---

### `GET /vagas/:id`

Exibe os detalhes de uma vaga específica.

* **Tela Utilizadora:** `Candidato / DetalhesVaga`
* **Headers:** `Authorization: Bearer <TOKEN_JWT>` *(opcional)*
* **Respostas:**
* `200 OK`:
```json
{
  "id": 12,
  "titulo": "Atendente de Balcão",
  "descricao": "Atendimento ao cliente e organização do balcão.",
  "requisitos": "Ensino médio completo.",
  "area": "alimentacao",
  "contrato": "clt",
  "regime": "presencial",
  "turno": "integral",
  "salario": 1412.00,
  "status": "aberta",
  "empresa": { "id": 4, "nome": "Padaria Guarabira Ltda" },
  "bairro": { "id": 10, "nome": "Centro" },
  "minhaCandidatura": { "id": 99, "status": "em_analise" }
}

```


* `404 Not Found`: `{ "erro": "Vaga não encontrada." }`



---

### `POST /vagas/:id/candidaturas`

Inscreve o candidato logado na vaga.

* **Tela Utilizadora:** `Candidato / DetalhesVaga`
* **Headers:** `Authorization: Bearer <TOKEN_JWT>` *(Requer perfil candidato)*
* **Respostas:**
* `201 Created`: `{ "id": 99, "vagaId": 12, "status": "enviada" }`
* `403 Forbidden`: `{ "erro": "Apenas candidatos podem se candidatar a vagas." }`
* `409 Conflict`: `{ "erro": "Você já se candidatou a esta vaga ou a vaga não está aberta." }`



---

### `GET /candidaturas/minhas`

Retorna as candidaturas do candidato logado.

* **Tela Utilizadora:** `Candidato / MinhasCandidaturas`
* **Headers:** `Authorization: Bearer <TOKEN_JWT>` *(Requer perfil candidato)*
* **Respostas:**
* `200 OK`:
```json
[
  {
    "id": 99,
    "vaga": { "id": 12, "titulo": "Atendente de Balcão" },
    "empresa": "Padaria Guarabira Ltda",
    "bairro": "Centro",
    "data": "2026-11-04T10:00:00.000Z",
    "status": "enviada"
  }
]

```





---

### `GET /empresas`

Lista as empresas cadastradas e o total de vagas abertas.

* **Tela Utilizadora:** `Candidato / MapaInicial`
* **Query Params:** `q`, `area`, `lat`, `lng`, `raioKm`
* **Respostas:**
* `200 OK`:
```json
[
  {
    "id": 4,
    "nome": "Padaria Guarabira Ltda",
    "setor": "alimentacao",
    "qtdVagasAbertas": 3,
    "bairro": { "id": 10, "nome": "Centro", "latitude": -6.8551, "longitude": -35.4912 }
  }
]

```





---

### `GET /empresas/:id`

Exibe os detalhes da empresa e suas vagas ativas.

* **Tela Utilizadora:** `Candidato / DetalhesEmpresa`
* **Respostas:**
* `200 OK`:
```json
{
  "id": 4,
  "nome": "Padaria Guarabira Ltda",
  "setor": "alimentacao",
  "descricao": "Padaria tradicional.",
  "telefone": "8332710000",
  "site": "[https://padariaguarabira.com.br](https://padariaguarabira.com.br)",
  "bairro": "Centro",
  "distanciaKm": 1.4,
  "vagasAbertas": [
    { "id": 12, "titulo": "Atendente de Balcão", "contrato": "clt", "salario": 1412.00 }
  ]
}

```





---

## 🏢 5. Painel da Empresa

### `POST /vagas`

Publica uma nova vaga.

* **Tela Utilizadora:** `Empresa / CriarVaga`
* **Headers:** `Authorization: Bearer <TOKEN_JWT>` *(Requer perfil empresa)*
* **Body:**
```json
{
  "titulo": "Auxiliar de Cozinha",
  "descricao": "Auxilio na preparação de alimentos e limpeza geral.",
  "requisitos": "Disponibilidade para turno matutino.",
  "area": "alimentacao",
  "contrato": "clt",
  "regime": "presencial",
  "turno": "manha",
  "cidadeId": 1,
  "bairroId": 10,
  "salario": 1500.00
}

```


* **Respostas:**
* `201 Created`: `{ "id": 13, "status": "aberta", "mensagem": "Vaga criada com sucesso!" }`
* `400 Bad Request`: `{ "erro": "A descrição deve conter no mínimo 20 caracteres." }`



---

### `PUT /vagas/:id`

Atualiza dados ou status de uma vaga (`aberta`, `pausada`, `encerrada`, `cancelada`).

* **Tela Utilizadora:** `Empresa / EditarVaga`
* **Headers:** `Authorization: Bearer <TOKEN_JWT>` *(Requer perfil empresa)*
* **Body:**
```json
{
  "titulo": "Auxiliar de Cozinha",
  "descricao": "Auxilio na preparação de alimentos e limpeza geral.",
  "requisitos": "Disponibilidade para turno matutino.",
  "area": "alimentacao",
  "contrato": "clt",
  "regime": "presencial",
  "turno": "manha",
  "cidadeId": 1,
  "bairroId": 10,
  "salario": 1600.00,
  "status": "pausada"
}

```


* **Respostas:**
* `200 OK`: `{ "mensagem": "Vaga atualizada com sucesso." }`
* `403 Forbidden`: `{ "erro": "Sua empresa não tem permissão para alterar esta vaga." }`



---

### `GET /empresa/vagas`

Retorna métricas do painel e as vagas da empresa logada.

* **Tela Utilizadora:** `Empresa / Painel` (Aba Vagas)
* **Headers:** `Authorization: Bearer <TOKEN_JWT>` *(Requer perfil empresa)*
* **Respostas:**
* `200 OK`:
```json
{
  "vagasAbertas": 2,
  "totalCandidaturas": 15,
  "itens": [
    {
      "id": 12,
      "titulo": "Atendente de Balcão",
      "status": "aberta",
      "qtdCandidaturas": 8,
      "dataCriacao": "2026-11-01T12:00:00.000Z"
    }
  ]
}

```





---

### `GET /empresa/candidaturas`

Lista todas as candidaturas recebidas nas vagas da empresa.

* **Tela Utilizadora:** `Empresa / Candidatos` (Aba Candidatos)
* **Headers:** `Authorization: Bearer <TOKEN_JWT>` *(Requer perfil empresa)*
* **Query Params:** `vagaId`, `status`
* **Respostas:**
* `200 OK`:
```json
[
  {
    "id": 99,
    "candidatoNome": "Juan Nicolas",
    "cargoPretendido": "Atendente de Balcão",
    "bairro": "Centro",
    "dataCandidatura": "2026-11-04T10:00:00.000Z",
    "status": "enviada",
    "urlCurriculoPdf": null
  }
]

```





---

### `PATCH /candidaturas/:id/status`

Altera o status da candidatura no processo seletivo.

* **Tela Utilizadora:** `Empresa / Candidatos` (Aba Candidatos)
* **Headers:** `Authorization: Bearer <TOKEN_JWT>` *(Requer perfil empresa)*
* **Body:**
```json
{
  "status": "em_analise"
}

```


* **Respostas:**
* `200 OK`: `{ "mensagem": "Status da candidatura atualizado." }`
* `403 Forbidden`: `{ "erro": "Sua empresa não possui permissão para alterar esta candidatura." }`
* `400 Bad Request`: `{ "erro": "Status inválido fornecido." }`
