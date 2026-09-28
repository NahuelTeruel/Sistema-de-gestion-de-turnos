import express from 'express';
import config from './config/config.js';
import routes from './routes/services.router.js';

const PORT = config.port;

const app = express();

// Middleware para parsear el body de las solicitudes JSON
// El orden es importante, debe ir antes de las rutas, porque se ejecuta en orden
app.use(express.json());

app.use('/api/services', routes);

export default app;