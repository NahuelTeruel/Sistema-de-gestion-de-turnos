import config from './config/config.js'; 
import app from './app.js';
import { connectDB } from './config/database.config.js';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { serviceModel } from './dao/models/service.model.js';
import { bookingModel } from './dao/models/booking.model.js';

const httpServer = createServer(app);
const io = new Server(httpServer);

if (!config.mongoUri) {
 throw new Error('Falta configurar MONGO_URI en las variables de entorno');
 }

const startServer = async () => {
  try {
    await connectDB();

    io.on('connection', async (socket) => {
      console.log('Nuevo cliente conectado', socket.id);

      try {
        // La lista inicial se envía a cada cliente que se conecta.
        const services = await serviceModel.find().lean();
        socket.emit('services_updated', services);

        const bookings = await bookingModel
          .find()
          .populate('services.service')
          .lean();
        socket.emit('bookings_updated', bookings);
      } catch (error) {
        console.error('Error al enviar los datos iniciales:', error.message);
      }
    });

    serviceModel.watch().on('change', async (change) => {
      console.log('Cambio detectado en la colección de servicios:', change);
      try {
        const services = await serviceModel.find().lean();
        io.emit('services_updated', services);
      } catch (error) {
        console.error('Error al emitir los servicios actualizados:', error.message);
      }
    });

    bookingModel.watch().on('change', async (change) => {
      console.log('Cambio detectado en la colección de reservas:', change);
      try {
        const bookings = await bookingModel
          .find()
          .populate('services.service')
          .lean();
        io.emit('bookings_updated', bookings);
      } catch (error) {
        console.error('Error al emitir las reservas actualizadas:', error.message);
      }
    });


    httpServer.listen(config.port, () => {
      console.log(`${config.appName} corriendo en http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar la aplicación:', error.message);
    process.exit(1);
  }
};

startServer();