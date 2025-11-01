import express from 'express';
import cors from 'cors'; 
import { userRoutes } from './routes/user.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Diz ao App para usar as rotas de usuário
app.use(userRoutes);


export { app };