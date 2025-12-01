<div align="center">
<img src="frontend/public/decola-vagas-logo.png" alt="Decola Vagas Logo" width="120" />
<h1>🚀 Decola Vagas</h1>
<h3>O Hub Definitivo de Oportunidades Académicas e Profissionais</h3>

<p>
<a href="#-sobre-o-projeto">Sobre</a> •
<a href="#-funcionalidades">Funcionalidades</a> •
<a href="#-tecnologias">Tecnologias</a> •
<a href="#-como-executar">Como Executar</a> •
<a href="#-licença">Licença</a>
</p>

</div>

📋 Sobre o Projeto

O Decola Vagas é uma plataforma full-stack projetada para resolver a fragmentação de oportunidades no ambiente académico. A aplicação centraliza estágios, iniciação científica, vagas de emprego e programas de trainee num único ecossistema, conectando diretamente alunos, professores, coordenadores e empresas parceiras.

Diferente de murais físicos ou grupos de mensagens desorganizados, o Decola Vagas oferece um sistema robusto de gestão de candidaturas, notificações automáticas por e-mail e perfis profissionais completos.

📸 Screenshots

<div align="center">
<!-- Adicione prints do seu projeto na pasta .github/assets ou use links externos -->
<img src="https://www.google.com/search?q=https://via.placeholder.com/800x400%3Ftext%3DDashboard%2Bdo%2BAluno" alt="Dashboard Preview" />





<img src="https://www.google.com/search?q=https://via.placeholder.com/800x400%3Ftext%3DPainel%2BAdministrativo" alt="Admin Preview" />
</div>

✨ Funcionalidades

O sistema possui um controlo de acesso baseado em cargos (RBAC) que habilita funcionalidades específicas para cada perfil:

🎓 Para Alunos

Mural Inteligente: Filtros avançados por área, categoria e tipo de vaga.

Candidatura em 1-Clique: Utilize o perfil cadastrado ou personalize com um currículo PDF específico.

Gestão de Carreira: Histórico completo de candidaturas e feedback em tempo real.

Favoritos: Guarde vagas para analisar posteriormente.

Notificações: Alertas por e-mail sobre novas vagas e atualizações de status.

🏢 Para Recrutadores (Empresas & Professores)

Gestão de Vagas: Criação, edição e publicação de oportunidades com editor de texto rico.

Workflow de Seleção: Pipeline visual para Aprovar, Rejeitar ou colocar candidaturas em Análise.

Triagem Eficiente: Visualização rápida de perfis e download direto de currículos.

Feedback Automático: O sistema notifica os candidatos sobre mudanças no processo seletivo.

🛡️ Para Administradores

Dashboard Analítico: Métricas globais de adesão, vagas ativas e instituições.

Gestão Multi-Instituição: Controlo de múltiplas universidades e empresas parceiras.

Controlo de Utilizadores: Gestão total de permissões e atribuição de cargos.

Auditoria: Visão geral de todas as atividades do sistema.

🛠️ Tecnologias Utilizadas

O projeto segue uma arquitetura Monorepo, garantindo tipagem consistente e fácil manutenção.

Frontend (/frontend)

Framework: Next.js 15 (App Router)

Linguagem: TypeScript

Estilização: Tailwind CSS + Shadcn/UI

Gestão de Estado: React Context API

Ícones: Lucide React

Editor de Texto: React Quill

Notificações: Sonner

Backend (/backend)

Runtime: Node.js

Framework: Express.js

Linguagem: TypeScript

ORM: Prisma

Base de Dados: MySQL 8.0

Autenticação: JWT (JSON Web Tokens) & BCrypt

Uploads: Multer (Armazenamento Local)

E-mails: Nodemailer (SMTP Gmail)

Tarefas Agendadas: Node-Cron (Lembretes automáticos)

Infraestrutura (/database)

Containerização: Docker & Docker Compose

Gestão de DB: phpMyAdmin incluído no compose

🚀 Como Executar

Pré-requisitos

Node.js (v20+)

Docker Desktop (Opcional, mas recomendado para a Base de Dados)

Git

1. Clonar o repositório

git clone [https://github.com/MGuimaraesN/Decola-Vagas.git](https://github.com/MGuimaraesN/Decola-Vagas.git)
cd Decola-Vagas


2. Configurar Variáveis de Ambiente

Aceda à pasta backend e configure o ficheiro .env baseado no exemplo:

cd backend
cp .env.example .env


Nota: É necessário configurar as credenciais do Gmail (GMAIL_USER, GMAIL_APP_PASS) para que o envio de e-mails funcione corretamente.

3. Instalação e Configuração

Na raiz do projeto, execute o comando mágico que instala dependências do frontend, backend e configura a base de dados:

# Instala dependências, sobe o Docker do banco, roda migrações e seed
npm run install:all


Se preferir rodar manualmente:

npm install (na raiz, no /frontend e no /backend)

docker-compose up -d (na pasta /database)

npx prisma migrate dev e npx prisma db seed (na pasta /backend)

4. Executar o Projeto

Para iniciar tanto o Frontend quanto o Backend em modo de desenvolvimento:

npm run dev


Frontend: http://localhost:3000

Backend: http://localhost:5000

phpMyAdmin: http://localhost:3310

🧪 Dados de Teste (Seed)

Ao rodar a instalação, a base de dados é populada automaticamente. Pode utilizar as seguintes credenciais para teste:

Perfil

E-mail

Senha

Super Admin

superadmin@decola.com

123456

Admin Inst.

admin@decola.com

123456

Empresa

recrutador@tech.com

123456

Aluno

aluno@decola.com

123456

📂 Estrutura do Projeto

Decola-Vagas/
├── backend/                # API Express e Lógica de Servidor
│   ├── prisma/             # Schemas e Migrations do Banco
│   ├── src/
│   │   ├── controllers/    # Lógica de Negócio
│   │   ├── middlewares/    # Autenticação, RBAC, Uploads
│   │   ├── routes/         # Definição de Rotas
│   │   └── services/       # Serviços de E-mail, etc.
│   └── ...
├── frontend/               # Aplicação Next.js
│   ├── app/                # App Router (Páginas)
│   ├── components/         # Componentes Reutilizáveis (Shadcn)
│   ├── context/            # AuthContext
│   └── ...
└── database/               # Configuração Docker


🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um Pull Request.

Faça um Fork do projeto

Crie uma Branch para a sua Feature (git checkout -b feature/MinhaFeature)

Faça o Commit (git commit -m 'Add: Minha nova feature')

Faça o Push (git push origin feature/MinhaFeature)

Abra um Pull Request

📄 Licença

Este projeto está sob a licença MIT. Veja o ficheiro LICENSE para mais detalhes.

<div align="center">
Desenvolvido com 💙 por <a href="https://github.com/MGuimaraesN">Mateus Guimarães</a>
</div>
