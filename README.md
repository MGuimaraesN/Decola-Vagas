# Decola-Vagas

Um portal único que centraliza todas as oportunidades acadêmicas (estágios, IC e vagas) de todas as áreas. Chega de vagas perdidas em e-mails ou murais físicos. Professores e coordenadores postam, e todos os alunos podem filtrar e encontrar sua próxima oportunidade de forma fácil e rápida.

Este projeto é um monorepo que contém:

  * **`frontend/`**: Uma aplicação Next.js (React).
  * **`backend/`**: Uma API Express.js com Prisma e TypeScript.
  * **`database/`**: Um arquivo `docker-compose.yml` para iniciar um banco de dados MySQL e o phpMyAdmin.

## 1\. Pré-requisitos

Antes de começar, você precisará ter as seguintes ferramentas instaladas:

  * **Node.js**:
      * **O que é?** Ambiente de execução para JavaScript (necessário para o `npm`, `frontend` e `backend`).
      * **Como instalar?** Baixe a versão LTS (v20.x ou superior) em [nodejs.org](https://nodejs.org/).
  * **Docker (com Docker Compose)**:
      * **O que é?** Ferramenta para criar e gerenciar contêineres. Usaremos para rodar o banco de dados MySQL sem precisar instalá-lo manualmente.
      * **Como instalar?** Baixe o [Docker Desktop](https://www.docker.com/products/docker-desktop/) para seu sistema (Windows, Mac ou Linux). O Docker Compose já vem incluído.

## 2\. Configuração do Banco de Dados (com Docker)

As credenciais do banco de dados já estão pré-configuradas no arquivo `database/docker-compose.yml`.

**1. Inicie o Contêiner do Banco de Dados**
Navegue até a pasta `database/` e execute o comando:

```bash
cd database
docker-compose up -d
```

  * Isso iniciará dois serviços em segundo plano:
      * Um banco de dados **MySQL** na porta `3306`.
      * Um **phpMyAdmin** (interface gráfica) na porta `3310`.

**2. Crie o Arquivo `.env` do Backend**
O backend (Prisma) precisa saber como se conectar ao banco de dados que você acabou de criar.

  * Crie um arquivo chamado `.env` dentro da pasta `backend/`.
  * Copie e cole o conteúdo abaixo nele:

<!-- end list -->

```env
# /backend/.env

# String de conexão baseada no docker-compose.yml
DATABASE_URL="mysql://mateus:Decola2025.@localhost:3306/DecolaVagas"
```

*(Esta string usa o usuário (`mateus`), senha (`Decola2025.`), porta (`3306`) e nome do banco (`DecolaVagas`) definidos no `docker-compose.yml`).*

**3. Execute as Migrações do Prisma**
Com o banco de dados rodando, precisamos criar as tabelas (como a tabela `User`).

  * Navegue até a pasta `backend/` e execute o comando de migração do Prisma:

<!-- end list -->

```bash
cd backend
npx prisma migrate dev
```

  * Após a conclusão, volte para a pasta raiz do projeto:

<!-- end list -->

```bash
cd ..
```

## 3\. Instalação das Dependências

Na **raiz do projeto**, execute o script `install:all`. Ele instalará as dependências para a raiz, o `backend` e o `frontend`.

```bash
npm run install:all
```

## 4\. Executando a Aplicação Completa

Com o banco de dados rodando e as dependências instaladas, basta executar o comando `dev` na **raiz do projeto**:

```bash
npm run dev
```

Este comando usará o `concurrently` para iniciar os dois servidores ao mesmo tempo:

  * 🚀 **Backend (Express)** estará rodando em `http://localhost:5000`.
  * 🚀 **Frontend (Next.js)** estará rodando em `http://localhost:3000`.

Abra [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) no seu navegador para ver a aplicação.

-----

## Scripts Úteis

  * **`npm run dev`**: Inicia ambos os servidores (backend e frontend).
  * **`npm run install:all`**: Instala todas as dependências do monorepo.
  * **`npm run dev --prefix backend`**: Inicia *apenas* o servidor backend.
  * **`npm run dev --prefix frontend`**: Inicia *apenas* o servidor frontend.
  * **`cd backend && npx prisma migrate dev`**: (Lembre-se de rodar este comando caso faça alterações no arquivo `backend/prisma/schema.prisma`).