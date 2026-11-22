import express from 'express';
import servicesRouter from './routes/services.router.js';
import bookingsRouter from './routes/bookings.router.js';
import viewRouter from './routes/view.router.js';
import { configureHandlebars } from './config/handlebars.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware para parsear el body de las solicitudes JSON
// El orden es importante, debe ir antes de las rutas, porque se ejecuta en orden
app.use(express.json());

app.use('/api/services', servicesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/', viewRouter);

app.use(express.static(path.join(__dirname, 'public')));

configureHandlebars(app, __dirname);

export default app;