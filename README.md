Projeto: App Lembrete de Beber Água (Teste Técnico)
Visão Geral
Este projeto consiste num aplicativo web e numa versão mobile simplificada para ajudar os utilizadores a lembrarem-se de beber água. Os utilizadores podem registar a quantidade de água que beberam ao longo dos dias e verificar se atingiram uma meta diária pré-estabelecida, calculada com base no seu peso.

Aplicação Web: Permite o cadastro de utilizadores (nome e peso), registo de consumo de água, visualização do progresso diário (mL consumidos, mL faltantes, meta) e histórico de consumo.

Aplicação Mobile: Versão simplificada onde o utilizador pode registar o seu nome e peso. Os dados são armazenados localmente e listados no próprio ecrã.

Tecnologias Utilizadas
Backend: Python 3.9+, FastAPI, SQLAlchemy, SQLite

Frontend Web: React (com JavaScript), Tailwind CSS

Mobile: React Native (com JavaScript), AsyncStorage

Servidor API (Desenvolvimento): Uvicorn

Gestor de Pacotes (Frontend/Mobile): npm (ou Yarn)

Arquitetura
O sistema é composto por:

Um Backend API (Python/FastAPI) que lida com a lógica de negócios e interação com o banco de dados.

Um Frontend Web (React) que consome a API para fornecer a interface ao utilizador.

Uma Aplicação Mobile (React Native) com funcionalidade de registo local.

+---------------------+     +---------------------+     +-----------------------+
|   Frontend Web      | --> |   Backend API       | <-- |   Banco de Dados      |
|   (React)           |     |   (Python/FastAPI)  |     |   (SQLite)            |
+---------------------+     +---------------------+     +-----------------------+

+---------------------+
|   App Mobile        |
|   (React Native)    |
|   (AsyncStorage)    |
+---------------------+

Consulte o documento Plano de Projeto: App Lembrete de Água para mais detalhes sobre a arquitetura.

Funcionalidades
Aplicação Web
Registo de Utilizador: Permite que novos utilizadores se registem com nome e peso.

Login Simplificado: Utilizadores existentes podem "entrar" informando o nome.

Painel de Controlo Diário:

Visualização da meta diária de água.

Quantidade de água já consumida no dia.

Quantidade de água restante para atingir a meta.

Indicação visual do progresso e se a meta foi atingida.

Registo de novas quantidades de água consumidas.

Histórico de Consumo: Visualização do histórico de consumo diário, mostrando a data, total consumido, meta do dia e se a meta foi atingida.

Persistência de Sessão: O utilizador atual é mantido no localStorage do navegador.

Aplicação Mobile
Registo Local de Utilizador: Permite registar nome e peso.

Listagem Local: Exibe os utilizadores registados localmente no dispositivo.

Armazenamento Local: Utiliza AsyncStorage para guardar os dados dos utilizadores.

Exclusão Local: Permite excluir utilizadores da lista local.

Configuração e Instalação
Pré-requisitos
Node.js (v16+) e npm (ou Yarn)

Python (v3.9+) e pip

Ambiente de desenvolvimento React Native configurado (Android Studio com SDK Android, Xcode para iOS - veja Guia Oficial React Native)

Estrutura de Pastas (Sugerida)
lembrete-agua-app/
├── backend/               # Código do FastAPI
│   ├── main.py
│   ├── crud.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   └── requirements.txt
├── frontend-web/          # Código do React (Web)
│   ├── public/
│   ├── src/
│   │   └── App.js
│   ├── package.json
│   └── ...
├── LembreteAguaMobile/            # Código do React Native (LembreteAguaMobile)
│   ├── android/
│   ├── ios/
│   ├── App.js
│   ├── package.json
│   └── ...
└── README.md              # Este ficheiro

1. Backend (FastAPI)
Navegue até a pasta backend/:

cd backend

Crie e ative um ambiente virtual:

python -m venv venv
# Linux/macOS
source venv/bin/activate
# Windows (Prompt de Comando)
# venv\Scripts\activate
# Windows (PowerShell)
# .\venv\Scripts\Activate.ps1

Instale as dependências:

pip install -r requirements.txt

(Se o requirements.txt não existir, crie-o com as seguintes dependências e depois execute pip install -r requirements.txt):

fastapi
uvicorn[standard]
sqlalchemy
pydantic[email]
# Para SQLite, geralmente não é necessário um driver separado com SQLAlchemy recente.
# Se usar PostgreSQL, adicione: psycopg2-binary

O banco de dados SQLite (lembrete_agua.db) será criado automaticamente na pasta backend/ na primeira execução.

Inicie o servidor:

uvicorn main:app --reload

A API estará disponível em http://127.0.0.1:8000 e a documentação interativa em http://127.0.0.1:8000/docs.

2. Frontend Web (React)
Navegue até a pasta frontend-web/ (se já não tiver um projeto React, crie-o com npx create-react-app frontend-web e substitua o src/App.js).

cd frontend-web


Inicie o servidor de desenvolvimento:

npm start

A aplicação web estará disponível em http://localhost:3000.



Navegue até a pasta do projeto mobile:

cd LembreteAguaMobile 


Execute o aplicativo:

Para Android:

Certifique-se de que tem um emulador Android a correr ou um dispositivo físico conectado.

Execute: npx react-native run-android

