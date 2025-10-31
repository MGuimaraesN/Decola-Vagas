// Importações de valor
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

// Importações de TIPO (necessário no modo ESM moderno)
import type { Request, Response } from 'express';

// --- Configuração ---
const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

// --- Middlewares ---
app.use(cors());       // Permite requisições do frontend (localhost:3000)
app.use(express.json()); // Habilita o parsing de JSON

// --- Rotas da API ---
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

app.post('/api/users', async (req: Request, res: Response) => {
  try {
    const { email, nome } = req.body;
    const novoUsuario = await prisma.user.create({
      data: { email, nome },
    });
    res.status(201).json(novoUsuario);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário (email pode já existir)' });
  }
});

// --- Iniciar Servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Backend (ESM) rodando em http://localhost:${PORT}`);
});