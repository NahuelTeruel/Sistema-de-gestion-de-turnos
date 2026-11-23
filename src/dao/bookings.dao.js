import { bookingModel } from './models/booking.model.js';

class BookingsDao {
    // Devuelve las reservas con los datos completos de cada servicio referenciado.
    // options: { filter, sort, skip, limit }. Sin limit devuelve todas.
    async getAll({ filter = {}, sort = {}, skip = 0, limit } = {}) {
        const query = bookingModel
            .find(filter)
            .sort(sort)
            .skip(skip)
            .populate('services.service');

        if (limit !== undefined) {
            query.limit(limit);
        }

        return query.lean();
    }

    async count(filter = {}) {
        return bookingModel.countDocuments(filter);
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
