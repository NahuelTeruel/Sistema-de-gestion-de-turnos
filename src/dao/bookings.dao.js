import { bookingModel } from './models/booking.model.js';

class BookingsDao {
    async getAll() {
        return bookingModel.find();
    }

    // Devuelve las reservas con los datos completos de cada servicio referenciado.
    async getAllWithServices() {
        return bookingModel
            .find()
            .populate('services.service')
            .lean();
    }

    async getById(id) {
        return bookingModel.findById(id);
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
