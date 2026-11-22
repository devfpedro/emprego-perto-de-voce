# Emprego Perto de Você — Mobile

Aplicativo mobile para candidatos encontrarem vagas próximas e empresas gerenciarem vagas e candidaturas. O app usa Expo, React Native e Expo Router.

## Requisitos

- Node.js e npm
- Expo Go instalado no Android ou iPhone
- Backend e banco de dados do projeto em execução

## Configurar o endereço do backend

Na pasta `mobile`, crie o arquivo local `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Edite `EXPO_PUBLIC_API_URL` em `.env` para usar o endereço IP do computador onde o backend está rodando:

```env
EXPO_PUBLIC_API_URL=http://IP_DO_COMPUTADOR:8000
```

Ao usar um celular físico, conecte o computador e o celular à mesma rede Wi-Fi e não use `localhost`: esse endereço apontaria para o próprio celular. O backend está configurado para escutar na porta `8000`.

## Iniciar banco e backend

Na raiz do repositório, inicie o PostgreSQL:

```bash
docker compose -f database/docker-compose.yml up -d
```

Configure as variáveis de ambiente do backend conforme [`backend/.env.example`](../backend/.env.example) e as instruções em [`database/README.md`](../database/README.md). Em seguida, inicie o backend:

```bash
cd backend
source .venv/bin/activate
python3 run.py
```

## Instalar e iniciar o app

Na pasta `mobile`, instale as dependências e inicie o Expo:

```bash
npm ci
npx expo start
```

Escaneie o QR code do terminal com o Expo Go. Se alterou a configuração ou o bundler estiver usando cache antigo, inicie com:

```bash
npx expo start -c
```

## Testar no navegador

O app também pode abrir no navegador com `npx expo start --web`, mas a tela do mapa usa `react-native-maps`, que depende de componentes nativos. Para testar o mapa, abra o projeto pelo Expo Go em Android ou iOS.

## Contas de demonstração

O banco disponibiliza contas fictícias para teste. Consulte a lista de e-mails e a senha em [`database/README.md`](../database/README.md).
