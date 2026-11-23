import express from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerDocument } from './config/swagger';
import { errorHandler } from './middlewares/error-handler';

import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import locationsRoutes from './modules/locations/locations.routes';
import categoriesRoutes from './modules/categories/categories.routes';
import assetsRoutes from './modules/assets/assets.routes';
import requestsRoutes from './modules/requests/requests.routes';
import requestLogsRoutes from './modules/request-logs/request-logs.routes';
import attachmentsRoutes from './modules/attachments/attachments.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

export const app = express();

// CORS อนุญาตเฉพาะ CLIENT_URL (http://localhost:3001)
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// เสิร์ฟรูปภาพ uploads
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Swagger UI ที่ /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Modules API
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/requests', requestLogsRoutes); // /api/requests/:id/logs
app.use('/api/requests', attachmentsRoutes); // /api/requests/:id/attachments
app.use('/api/notifications', notificationsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler
app.use(errorHandler);
