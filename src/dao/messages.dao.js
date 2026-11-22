import { messageModel } from './models/message.model.js';

class MessagesDao {
    async getAll() {
        // Orden cronológico: los mensajes más antiguos primero.
        return messageModel.find().sort({ createdAt: 1 }).lean();
    }

    async getById(id) {
        return messageModel.findById(id).lean();
    }

    async create(data) {
        return messageModel.create(data);
    }

    async update(id, data = {}) {
        // _id es inmutable y __v lo administra Mongoose: no deben viajar en el update.
        const { _id, __v, ...cleanData } = data;

        return messageModel.findByIdAndUpdate(
            id,
            { $set: cleanData },
            { returnDocument: 'after', runValidators: true }
        );
    }

    async delete(id) {
        return messageModel.findByIdAndDelete(id);
    }
}

export default MessagesDao;
