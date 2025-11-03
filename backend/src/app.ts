import express from 'express';
import cors from 'cors'; 
import { userRoutes } from './routes/user.routes.js';
import { categoryRoutes } from './routes/category.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Diz ao App para usar as rotas de usuário
app.use('/auth', userRoutes);
app.use('/categories', categoryRoutes);

export { app };