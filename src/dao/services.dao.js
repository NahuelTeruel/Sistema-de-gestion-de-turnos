import { serviceModel } from './models/service.model.js';

class ServicesDao {
    // options: { filter, sort, skip, limit }. Sin limit devuelve todos los documentos.
    async getAll({ filter = {}, sort = {}, skip = 0, limit } = {}) {
        const query = serviceModel.find(filter).sort(sort).skip(skip);

        if (limit !== undefined) {
            query.limit(limit);
        }

        return query.lean();
    }

    async count(filter = {}) {
        return serviceModel.countDocuments(filter);
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
