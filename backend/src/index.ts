import { app } from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 5000;

// --- Iniciar Servidor ---
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});