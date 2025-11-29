import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { userRoutes } from './routes/user.routes.js';
import { categoryRoutes } from './routes/category.routes.js';
import { jobRoutes } from './routes/job.routes.js';
import { institutionRoutes } from './routes/institution.routes.js';
import { roleRoutes } from './routes/role.routes.js';
import { areaRoutes } from './routes/area.routes.js';
import { adminRoutes } from './routes/admin.routes.js';
import { savedJobRoutes } from './routes/savedjob.routes.js';
import { applicationRoutes } from './routes/application.routes.js';
import { globalErrorHandler } from './middlewares/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use('/auth', userRoutes);
app.use('/categories', categoryRoutes);
app.use('/jobs', jobRoutes);
app.use('/institutions', institutionRoutes);
app.use('/roles', roleRoutes);
app.use('/areas', areaRoutes);
app.use('/admin', adminRoutes);
app.use('/saved-jobs', savedJobRoutes);
app.use('/applications', applicationRoutes);

// Middleware de Erro deve ser o último
app.use(globalErrorHandler);

export default app;