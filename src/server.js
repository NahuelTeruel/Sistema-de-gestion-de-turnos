import config from './config/config.js'; 
import app from './app.js';
import { connectDB } from './config/database.config.js';
import { createServer } from 'node:http';

const httpServer = createServer(app);

if (!config.mongoUri) {
 throw new Error('Falta configurar MONGO_URI en las variables de entorno');
 }

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(config.port, () => {
      console.log(`${config.appName} corriendo en http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar la aplicación:', error.message);
    process.exit(1);
  }
};

startServer();