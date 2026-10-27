import express from 'express';
import servicesRouter from './routes/services.router.js';
import bookingsRouter from './routes/bookings.router.js';

const app = express();

// Middleware para parsear el body de las solicitudes JSON
// El orden es importante, debe ir antes de las rutas, porque se ejecuta en orden
app.use(express.json());

app.use('/api/services', servicesRouter);
app.use('/api/bookings', bookingsRouter);

export default app;