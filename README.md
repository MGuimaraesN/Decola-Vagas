# 🚀 Decola Vagas

![Project Status](https://img.shields.io/badge/status-em_desenvolvimento-orange)
![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat&logo=Prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

> **O Hub de Oportunidades Acadêmicas.** Centralize estágios, iniciação científica e vagas de emprego em um único portal integrado à sua instituição de ensino.

---

## 📋 Sobre o Projeto

O **Decola Vagas** resolve o problema da fragmentação de oportunidades em ambientes acadêmicos. Em vez de murais físicos ou e-mails perdidos, a plataforma oferece um ambiente unificado onde coordenadores, professores e empresas parceiras publicam vagas, e alunos podem se candidatar com facilidade.

O projeto é estruturado como um **Monorepo**, garantindo consistência entre o Frontend e o Backend.

---

## ✨ Funcionalidades Principais

### 🎓 Para Alunos
- **Mural de Vagas:** Filtros avançados por área, categoria e tipo.
- **Candidatura Simplificada:** Aplicação em vagas com um clique (usando perfil ou PDF).
- **Gestão de Currículo:** Upload de currículo e perfil profissional.
- **Favoritos:** Salve vagas para analisar depois.
- **Notificações:** Acompanhamento do status das candidaturas (Aprovado/Reprovado).

### 🏢 Para Recrutadores (Empresas/Professores)
- **Gestão de Vagas:** Criação, edição e fechamento de vagas.
- **Triagem de Candidatos:** Visualização de perfis e download de currículos.
- **Workflow de Aprovação:** Aceitar ou rejeitar candidaturas com feedback automático.

### 🛡️ Para Administradores
- **Dashboard Analítico:** Métricas globais de usuários e vagas.
- **Gestão de Usuários:** Controle total de permissões (RBAC) e instituições.
- **Auditoria:** Visão geral de todas as atividades do sistema.

---

## 🛠️ Stack Tecnológica

### **Frontend** (`/frontend`)
- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Estilização:** Tailwind CSS + Shadcn/UI
- **Ícones:** Lucide React
- **Editor de Texto:** React Quill

### **Backend** (`/backend`)
- **API:** Node.js com Express
- **Linguagem:** TypeScript
- **ORM:** Prisma (MySQL)
- **Autenticação:** JWT & BCrypt
- **Uploads:** Multer
- **E-mails:** Nodemailer (Gmail SMTP)
- **Jobs:** Node-Cron (Tarefas agendadas)

### **Infraestrutura** (`/database`)
- **Banco de Dados:** MySQL 8.0
- **Containerização:** Docker & Docker Compose
- **Gerenciamento de DB:** phpMyAdmin

---

## 🚀 Como Executar o Projeto

### 1. Pré-requisitos
Certifique-se de ter instalado:
- [Node.js](https://nodejs.org/) (v20+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 2. Instalação
Na raiz do projeto, execute o script que instala as dependências de todas as pastas:

```bash
npm run install:all
