import dotenv from 'dotenv';

dotenv.config();

const config = {
    port: process.env.PORT || 8080,
    appName: process.env.APP_NAME || 'Sistema de Gestión de Turnos',
    appEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGO_URI,
}

export default config
