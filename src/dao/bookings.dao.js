import { bookingModel } from './models/booking.model.js';

// DAO de reservas: única capa que conoce el medio de persistencia (MongoDB).
// No contiene reglas de negocio ni validaciones del dominio.
class BookingsDao {
    async getAll() {
        return bookingModel.find();
    }

    async getById(id) {
        return bookingModel.findById(id);
    }

    async create(data) {
        return bookingModel.create(data);
    }

    async update(id, data) {
        // El _id y los campos internos de Mongo no se pisan desde el body.
        const changes = { ...data };
        delete changes._id;
        delete changes.id;
        delete changes.__v;

        return bookingModel.findByIdAndUpdate(
            id,
            changes,
            { returnDocument: 'after', runValidators: true }
        );
    }
}

export default BookingsDao;
