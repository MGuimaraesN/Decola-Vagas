import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Função auxiliar para pegar item aleatório de uma lista
function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

async function main() {
  console.log('🚀 Iniciando Seed Otimizado...');

  // =================================================
  // 1. ROLES (Papéis do Sistema)
  // =================================================
  const rolesList = [
    'superadmin', 'admin', 'professor', 'coordenador', 'empresa', 'student'
  ];
  const roleMap: Record<string, number> = {};

  console.log(`👤 Criando/Atualizando Roles...`);
  for (const name of rolesList) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    roleMap[name] = role.id;
  }

  // =================================================
  // 2. AREAS
  // =================================================
  const areasList = [
    'Engenharia de Software', 'Ciência de Dados', 'Design UI/UX', 
    'Marketing Digital', 'Recursos Humanos', 'Contabilidade', 
    'Direito Civil', 'Enfermagem', 'Administração', 'Psicologia'
  ];
  const areaIds: number[] = [];

  console.log(`📚 Criando/Atualizando Áreas...`);
  for (const name of areasList) {
    const area = await prisma.area.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    areaIds.push(area.id);
  }

  // =================================================
  // 3. INSTITUTIONS
  // =================================================
  const institutionsList = [
    'Universidade Federal Alpha', 'Instituto Beta de Tecnologia', 
    'Faculdade Gama', 'Universidade Delta do Sul'
  ];
  const instIds: number[] = [];

  console.log(`iu Criando/Atualizando Instituições...`);
  for (const name of institutionsList) {
    const inst = await prisma.institution.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    instIds.push(inst.id);
  }

  // =================================================
  // 4. CATEGORIES
  // =================================================
  const categoriesList = [
    'Estágio', 'Vaga Júnior', 'Vaga Pleno', 'Vaga Sênior',
    'Trainee', 'Iniciação Científica'
  ];
  const catIds: number[] = [];

  console.log(`🏷️ Criando/Atualizando Categorias...`);
  for (const name of categoriesList) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    catIds.push(cat.id);
  }

  // =================================================
  // 5. USERS (Contas Funcionais para Teste)
  // =================================================
  console.log('👥 Criando Usuários de Teste...');
  const password = await bcrypt.hash('123456', 10);
  
  // Lista de usuários para criar. 
  // O 'roleKey' deve bater com as chaves do roleMap acima.
  const usersToCreate = [
    { email: 'superadmin@decolavagas.com', role: 'superadmin', first: 'Super', last: 'Admin' },
    { email: 'admin@decolavagas.com', role: 'admin', first: 'Admin', last: 'Institucional' },
    { email: 'professor@decolavagas.com', role: 'professor', first: 'Professor', last: 'Silva' },
    { email: 'coordenador@decolavagas.com', role: 'coordenador', first: 'Coordenador', last: 'Santos' },
    { email: 'empresa@decolavagas.com', role: 'empresa', first: 'Recrutador', last: 'Tech' },
    { email: 'aluno@decolavagas.com', role: 'student', first: 'Aluno', last: 'Exemplar' },
  ];

  const authorUserIds: number[] = []; // IDs de quem pode postar vagas

  for (const u of usersToCreate) {
    // Escolhe uma instituição fixa (a primeira) para facilitar os testes
    const mainInstitutionId = instIds[0]; 
    const roleId = roleMap[u.role];

    // 1. Cria ou atualiza o User
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        // Garante que se o usuário já existir, a instituição ativa seja corrigida
        activeInstitutionId: mainInstitutionId 
      },
      create: {
        firstName: u.first,
        lastName: u.last,
        email: u.email,
        password,
        ip: '127.0.0.1',
        activeInstitutionId: mainInstitutionId, // IMPORTANTE: Define a instituição ativa
        bio: `Bio de teste para ${u.first}`,
        linkedinUrl: 'https://linkedin.com',
      }
    });

    // 2. Cria o vínculo UserInstitutionRole
    await prisma.userInstitutionRole.upsert({
      where: {
        userId_institutionId: {
          userId: user.id,
          institutionId: mainInstitutionId
        }
      },
      update: { roleId: roleId },
      create: {
        userId: user.id,
        institutionId: mainInstitutionId,
        roleId: roleId
      }
    });

    // Se for um papel que pode criar vagas, adiciona ao array de autores
    if (['empresa', 'professor', 'coordenador', 'admin', 'superadmin'].includes(u.role)) {
      authorUserIds.push(user.id);
    }

    console.log(`   ✅ Usuário criado: ${u.email} (Senha: 123456)`);
  }

  // =================================================
  // 6. JOBS (Gerando Vagas)
  // =================================================
  console.log('💼 Gerando Vagas Aleatórias...');
  
  const jobTitles = ['Desenvolvedor', 'Analista', 'Gerente', 'Auxiliar', 'Consultor', 'Designer'];
  const jobLevels = ['Júnior', 'Pleno', 'Sênior', 'Estagiário'];

  // Vamos criar 20 vagas
  for (let i = 0; i < 20; i++) {
    const randomAreaId = getRandomItem(areaIds);
    const randomCatId = getRandomItem(catIds);
    const randomInstId = getRandomItem(instIds); // Vagas espalhadas pelas instituições
    
    // IMPORTANTE: Autor deve ser alguém válido (não aluno)
    const randomAuthorId = getRandomItem(authorUserIds); 

    const title = `${getRandomItem(jobTitles)} ${getRandomItem(jobLevels)}`;
    
    await prisma.job.create({
      data: {
        authorId: randomAuthorId,
        institutionId: randomInstId,
        areaId: randomAreaId,
        categoryId: randomCatId,
        title: title,
        description: `Vaga gerada automaticamente para ${title}. Requisitos: Vontade de aprender e crescer com a equipe.`,
        email: `rh${i}@empresa.com`,
        telephone: `119${Math.floor(Math.random() * 100000000)}`,
        status: i % 5 === 0 ? 'rascunho' : 'published', // Algumas vagas como rascunho
        isPublic: i % 3 === 0, // Algumas vagas públicas (empresa)
        companyName: i % 3 === 0 ? 'Tech Solutions Ltda' : undefined,
        ip: '127.0.0.1',
      },
    });
  }

  console.log('✅ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });