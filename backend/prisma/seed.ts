import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Função auxiliar para pegar item aleatório de uma lista
function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

async function main() {
  console.log('🚀 Iniciando Seed Massivo...');

  // =================================================
  // 1. ROLES (Papéis do Sistema)
  // =================================================
  const rolesList = [
    'superadmin', 'admin', 'professor', 'coordenador', 'empresa', 'student',
    'visitante', 'auditor', 'mentor', 'suporte'
  ];
  const roleMap: Record<string, string> = {};

  console.log(`👤 Criando/Atualizando ${rolesList.length} Roles...`);
  for (const name of rolesList) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    roleMap[name] = role.id;
  }

  // =================================================
  // 2. AREAS (Áreas de Atuação - 20+)
  // =================================================
  const areasList = [
    'Engenharia de Software', 'Ciência de Dados', 'Segurança da Informação',
    'Design UI/UX', 'Marketing Digital', 'Recursos Humanos',
    'Contabilidade', 'Direito Civil', 'Enfermagem', 'Medicina',
    'Arquitetura', 'Engenharia Civil', 'Logística', 'Vendas',
    'Atendimento ao Cliente', 'Gestão de Projetos', 'Biomedicina',
    'Nutrição', 'Jornalismo', 'Psicologia', 'Educação Física'
  ];
  const areaIds: string[] = [];

  console.log(`📚 Criando/Atualizando ${areasList.length} Áreas...`);
  for (const name of areasList) {
    const area = await prisma.area.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    areaIds.push(area.id);
  }

  // =================================================
  // 3. INSTITUTIONS (20 Instituições)
  // =================================================
  const institutionsList = [
    'Universidade Federal Alpha', 'Instituto Beta de Tecnologia', 'Faculdade Gama',
    'Universidade Delta do Sul', 'Escola Técnica Epsilon', 'Zeta University',
    'Faculdade de Artes Omega', 'Instituto Politécnico Sigma', 'Universidade Aberta Theta',
    'Centro Universitário Iota', 'Kappa Business School', 'Lambda Tech Academy',
    'Faculdade de Medicina Mu', 'Escola de Direito Nu', 'Xi Design School',
    'Omicron Science Center', 'Pi Mathematics Institute', 'Rho Engineering College',
    'Tau Health Academy', 'Upsilon Global University'
  ];
  const instIds: string[] = [];

  console.log(`iu Criando/Atualizando ${institutionsList.length} Instituições...`);
  for (const name of institutionsList) {
    const inst = await prisma.institution.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    instIds.push(inst.id);
  }

  // =================================================
  // 4. CATEGORIES (Categorias de Vagas)
  // =================================================
  const categoriesList = [
    'Estágio', 'Vaga Júnior', 'Vaga Pleno', 'Vaga Sênior',
    'Trainee', 'Iniciação Científica', 'Voluntariado',
    'Freelance', 'Temporário', 'PJ', 'Summer Job', 'Part-time'
  ];
  const catIds: string[] = [];

  console.log(`🏷️ Criando/Atualizando ${categoriesList.length} Categorias...`);
  for (const name of categoriesList) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    catIds.push(cat.id);
  }

  // =================================================
  // 5. USERS (Usuários fixos + Gerados)
  // =================================================
  console.log('👥 Criando Usuários...');
  const password = await bcrypt.hash('123456', 10);
  const userIds: string[] = [];

  // 5.1 Usuários Principais (Admin e SuperAdmin)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@decolavagas.com' },
    update: {},
    create: {
      firstName: 'Super', lastName: 'Admin', email: 'superadmin@decolavagas.com',
      password, ip: '127.0.0.1'
    }
  });
  
  // 5.2 Loop para criar 30 usuários genéricos (Alunos e Empresas)
  for (let i = 1; i <= 30; i++) {
    const isEmpresa = i % 5 === 0; // A cada 5 usuários, 1 é empresa
    const email = isEmpresa ? `empresa${i}@decolavagas.com` : `aluno${i}@decolavagas.com`;
    const roleId = isEmpresa ? roleMap['empresa'] : roleMap['student'];
    const roleName = isEmpresa ? 'Recrutador' : 'Aluno';

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        firstName: roleName,
        lastName: `Teste ${i}`,
        email,
        password,
        ip: '127.0.0.1'
      }
    });
    userIds.push(user.id);

    // Vínculo com instituição aleatória
    try {
      await prisma.userInstitutionRole.create({
        data: {
          userId: user.id,
          institutionId: getRandomItem(instIds),
          roleId: roleId
        }
      });
    } catch (e) { /* Ignora duplicidade */ }
  }

  // =================================================
  // 6. JOBS (Gerando 50 vagas aleatórias)
  // =================================================
  console.log('💼 Gerando 50 Vagas Aleatórias...');
  
  const jobTitles = ['Desenvolvedor', 'Analista', 'Gerente', 'Auxiliar', 'Consultor', 'Designer', 'Técnico', 'Pesquisador'];
  const jobLevels = ['Júnior', 'Pleno', 'Sênior', 'Estagiário', 'Bolsista'];

  for (let i = 0; i < 50; i++) {
    // Sorteia dados para montar a vaga
    const randomAreaId = getRandomItem(areaIds);
    const randomCatId = getRandomItem(catIds);
    const randomInstId = getRandomItem(instIds);
    const randomAuthorId = getRandomItem(userIds); // Pega um usuário qualquer como autor (idealmente seria só empresa)

    // Busca o nome da área para compor o título (ex: "Analista Júnior em Marketing")
    // Como só temos o ID aqui, vamos fazer titulos genéricos combinados
    const title = `${getRandomItem(jobTitles)} ${getRandomItem(jobLevels)}`;
    
    await prisma.job.create({
      data: {
        authorId: randomAuthorId, // Autor da vaga
        institutionId: randomInstId,
        areaId: randomAreaId,
        categoryId: randomCatId,
        title: title,
        description: `Esta é uma vaga gerada automaticamente para a posição de ${title}. Ótima oportunidade de crescimento. Requisitos: Proatividade e vontade de aprender.`,
        email: `vaga${i}@exemplo.com`,
        telephone: `119${Math.floor(Math.random() * 100000000)}`, // Gera telefone aleatório
        status: 'published',
        ip: '127.0.0.1',
      },
    });
  }

  console.log('✅ Seed completo finalizado! O banco está cheio de dados.');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });