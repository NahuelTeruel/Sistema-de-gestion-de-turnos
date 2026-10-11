import express from 'express';
import config from './config/config.js';
import servicesRouter from './routes/services.router.js';
import bookingsRouter from './routes/bookings.router.js';
//import ServiceManager from './managers/ServiceManager.js';

const PORT = config.port;

const app = express();

// Middleware para parsear el body de las solicitudes JSON
// El orden es importante, debe ir antes de las rutas, porque se ejecuta en orden
app.use(express.json());

app.use('/api/services', servicesRouter);
app.use('/api/bookings', bookingsRouter);
//const service = new ServiceManager("./src/data/services.json");

export default app;