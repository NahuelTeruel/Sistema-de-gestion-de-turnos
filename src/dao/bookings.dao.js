import { bookingModel } from './models/booking.model.js';

class BookingsDao {
    // Devuelve las reservas con los datos completos de cada servicio referenciado.
    async getAll() {
        return bookingModel
            .find()
            .populate('services.service')
            .lean();
    }

    // Devuelve una reserva con los datos completos de cada servicio referenciado.
    async getById(id) {
        return bookingModel
            .findById(id)
            .populate('services.service')
            .lean();
    }

    async create(booking) {
        return bookingModel.create(booking);
    }

    async update(id, data = {}) {
        // _id es inmutable y __v lo administra Mongoose: no deben viajar en el update.
        const { _id, __v, ...cleanData } = data;

        return bookingModel.findByIdAndUpdate(
            id,
            { $set: cleanData },
            { returnDocument: 'after', runValidators: true }
        );
    }

    async delete(id) {
        return bookingModel.findByIdAndDelete(id);
    }
}

export default BookingsDao;
