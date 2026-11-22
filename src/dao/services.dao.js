import { serviceModel } from './models/service.model.js';

class ServicesDao {
    async getAll() {
        return serviceModel.find().lean();
    }

    async getById(id) {
        return serviceModel.findById(id).lean();
    }

    async create(data) {
        return serviceModel.create(data);
    }

    async update(id, data = {}) {
        // _id es inmutable y __v lo administra Mongoose: no deben viajar en el update.
        const { _id, __v, ...cleanData } = data;

        return serviceModel.findByIdAndUpdate(
            id,
            { $set: cleanData },
            { returnDocument: 'after', runValidators: true }
        );
    }

    async delete(id) {
        return serviceModel.findByIdAndDelete(id);
    }
}

export default ServicesDao;
