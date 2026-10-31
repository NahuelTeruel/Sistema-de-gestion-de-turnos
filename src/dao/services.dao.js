import { serviceModel } from './models/service.model.js';

class ServicesDao {
    async getAll() {
        return serviceModel.find();
    }

    async getById(id) {
        return serviceModel.findById(id);
    }

    async create(data) {
        return serviceModel.create(data);
    }

    async update(id, data) {
        const changes = { ...data };

        return serviceModel.findByIdAndUpdate(
            id,
            changes,
            { returnDocument: 'after', runValidators: true }
        );
    }

    async delete(id) {
        return serviceModel.findByIdAndDelete(id);
    }
}

export default ServicesDao;
