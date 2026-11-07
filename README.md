# Emprego Perto de Você 📍

O **Emprego Perto de Você** é uma plataforma digital focada em conectar rapidamente candidatos a oportunidades de trabalho locais de forma simplificada e geolocalizada. O foco é atender pequenas e médias empresas que precisam preencher vagas com moradores da própria região ou bairro.

## 💻 Sobre o Projeto

Este Produto Mínimo Viável (MVP) está sendo desenvolvido pela equipe **Iteravise** como parte da disciplina de Gerência de Projetos de Software (Curso de Sistemas para Internet). O projeto é gerenciado utilizando metodologias ágeis (Scrum/Kanban) através do Jira, com ciclos semanais de entrega (Sprints).

## 🛠️ Tecnologias Utilizadas

- **Front-end:** React Native e Expo
- **Back-end:** Python e Flask
- **Banco de Dados:** PostgreSQL 17 e PostGIS 3.5
- **Comunicação com o banco:** Psycopg
- **Autenticação:** JWT
- **Gerenciamento:** Jira
- **Prototipação:** Figma
- **Versionamento:** Git e GitHub

## 📁 Estrutura do Projeto

O projeto está organizado em três partes principais:

```text
emprego-perto-de-voce/
├── backend/       # API desenvolvida com Python e Flask
├── database/      # Banco de dados e arquivos SQL
├── mobile/        # Aplicativo desenvolvido com React Native e Expo
├── LICENSE
└── README.md
```

## 🚀 Como Executar o Projeto

Para executar o projeto localmente, siga as etapas abaixo.

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

Após iniciar o container, execute os scripts para criar a estrutura e inserir os dados iniciais:

```bash
docker exec -i emprego-perto-db psql -U emprego_user -d emprego_perto_de_voce < database/schema.sql
```

```bash
docker exec -i emprego-perto-db psql -U emprego_user -d emprego_perto_de_voce < database/seed.sql
```

Para criar os índices:

```bash
docker exec -i emprego-perto-db psql -U emprego_user -d emprego_perto_de_voce -v ON_ERROR_STOP=1 -f /dev/stdin < database/indexes.sql
```

**Observação:** os comandos de criação da estrutura e inserção dos dados iniciais devem ser executados quando o banco ainda não tiver sido inicializado. Não execute novamente sem verificar o estado do banco.

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

Instale as dependências:

```bash
pip install -r requirements.txt
```

Crie o arquivo de configuração local a partir do exemplo:

```bash
cp .env.example .env
```

O arquivo `.env` contém as configurações de conexão com o banco e a chave JWT. Configure uma chave secreta própria para o ambiente local.

Inicie a API:

```bash
python run.py
```

Por padrão, o back-end será executado na porta **8000**.

Para verificar se a API está respondendo, acesse:

```text
http://localhost:8000/saude
```

A rota de saúde retorna:

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

**Observação sobre a API:** atualmente, o arquivo `mobile/src/service/api.ts` está configurado com `USE_MOCK = true`, utilizando dados simulados para a autenticação. O endereço definido para chamadas reais é `http://192.168.1.10:3333`, que ainda precisa ser alinhado à configuração do back-end Flask, executado por padrão na porta 8000.

## 👥 Equipe Iteravise

O desenvolvimento e a gerência do projeto funcionam em um sistema de rodízio semanal de funções entre os membros:

- Artur Crispim de Andrade
- Erick Felipe Santos Menezes
- Juan Nicolas Gomes dos Santos
- Paulo Gomes de Sousa Junior
- Pedro Henrique Santos de Pontes

---

📄 **Licença:** Este projeto está sob a licença MIT.