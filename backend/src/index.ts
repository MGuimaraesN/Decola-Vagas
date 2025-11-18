import app from './app.js';

const port = process.env.PORT || 5000;

// --- Iniciar Servidor ---
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});