import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create Roles
  const superadminRole = await prisma.role.create({
    data: { name: 'superadmin' },
  });
  const adminRole = await prisma.role.create({
    data: { name: 'admin' },
  });
  const professorRole = await prisma.role.create({
    data: { name: 'professor' },
  });
  const coordenadorRole = await prisma.role.create({
    data: { name: 'coordenador' },
  });
  const empresaRole = await prisma.role.create({
    data: { name: 'empresa' },
  });
  const studentRole = await prisma.role.create({
    data: { name: 'student' },
  });

  // Create Institutions
  const institution1 = await prisma.institution.create({
    data: { name: 'Universidade Federal Alpha' },
  });
  const institution2 = await prisma.institution.create({
    data: { name: 'Instituto Beta' },
  });

  // Create Areas
  const area1 = await prisma.area.create({
    data: { name: 'Engenharia de Software' },
  });
  const area2 = await prisma.area.create({
    data: { name: 'Saúde' },
  });
  const area3 = await prisma.area.create({
    data: { name: 'Design' },
  });

  // Create Categories
  const category1 = await prisma.category.create({
    data: { name: 'Estágio' },
  });
  const category2 = await prisma.category.create({
    data: { name: 'Iniciação Científica' },
  });
  const category3 = await prisma.category.create({
    data: { name: 'Vaga Júnior' },
  });

  // Create Users
  const hashedPassword = await bcrypt.hash('123456', 10);
  const superadminUser = await prisma.user.create({
    data: {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@decolavagas.com',
      password: hashedPassword,
      ip: '127.0.0.1',
    },
  });
  const adminUser = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@decolavagas.com',
      password: hashedPassword,
      ip: '127.0.0.1',
    },
  });
  const commonUser = await prisma.user.create({
    data: {
      firstName: 'Common',
      lastName: 'User',
      email: 'user@decolavagas.com',
      password: hashedPassword,
      ip: '127.0.0.1',
    },
  });

  // Associate Users with Institutions and Roles
  await prisma.userInstitutionRole.create({
    data: {
      userId: superadminUser.id,
      institutionId: institution1.id,
      roleId: superadminRole.id,
    },
  });
  await prisma.userInstitutionRole.create({
    data: {
      userId: adminUser.id,
      institutionId: institution1.id,
      roleId: adminRole.id,
    },
  });
  await prisma.userInstitutionRole.create({
    data: {
      userId: commonUser.id,
      institutionId: institution2.id,
      roleId: studentRole.id,
    },
  });

  // Create Jobs
  await prisma.job.create({
    data: {
      authorId: adminUser.id,
      title: 'Desenvolvedor Full-Stack Júnior',
      email: 'admin@decolavagas.com',
      telephone: '11999999999',
      description: 'Vaga para desenvolvedor full-stack júnior.',
      areaId: area1.id,
      categoryId: category3.id,
      status: 'published',
      ip: '127.0.0.1',
      institutionId: institution1.id,
    },
  });
  await prisma.job.create({
    data: {
      authorId: adminUser.id,
      title: 'Estágio em Design',
      email: 'admin@decolavagas.com',
      telephone: '11999999999',
      description: 'Vaga de estágio para área de design.',
      areaId: area3.id,
      categoryId: category1.id,
      status: 'published',
      ip: '127.0.0.1',
      institutionId: institution1.id,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
