import { servicesService } from '../services/services.service.js';

class ViewController {
    static async getServicesView(req, res, next) {
        try {
            const services = await servicesService.getServices();
            res.render('services', { title: 'Servicios', services });
        } catch (error) {
            next(error);
        }
    };
}

export default ViewController;