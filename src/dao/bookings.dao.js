import { bookingModel } from './models/booking.model.js';

class BookingsDao {
    async getAll() {
        return bookingModel.find();
    }

    async getById(id) {
        return bookingModel.findById(id);
    }

    async create(booking) {
        return bookingModel.create(booking);
    }

    async update(id, changes) {
        return bookingModel.findByIdAndUpdate(
            id,
            changes,
            { returnDocument: 'after', runValidators: true }
        );
    }

    async delete(id) {
        return bookingModel.findByIdAndDelete(id);
    }
}

export default BookingsDao;
