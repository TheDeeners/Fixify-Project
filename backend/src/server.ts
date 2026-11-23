import { app } from './app';
import { env } from './config/env';

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Fixify Backend Server running on http://localhost:${env.PORT}`);
  console.log(`📑 Swagger Documentation available at http://localhost:${env.PORT}/api-docs`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server.');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
