import express from 'express';
import config from './config/config.js';

const PORT = config.port;

const app = express();

app.listen(PORT, () => {
  console.log(`Servidor escuchando en localhost:${PORT}`);
});

const services = [
    {
        id:1,
        name: "Consulta psicologica",
        description: "Servicio de consulta con un psicologo",
        price: 30000,
        duration:40,
        available:true,
        category: "psicología"
    },
    { 
        id:2,
        name: "Consulta medica",
        description: "Servicio de consulta con un medico clinico",
        price: 40000,
        duration:30,
        available:true,
        category: "especialistas"

    },
    {
        id:3,
        name: "Consulta dermatologica",
        description: "Servicio de consulta con un medico dermatologo",
        price: 45000,
        duration:30,
        available:true,
        category: "especialistas"
    }
]

//GET api/services
app.get('/api/services', (req, res) => {const {category} = req.query
    if (category){
        const filterServices = services.filter(
            service => service.category === category
        )
    return res.status(200).json({
        status:"success",
        payload : filterServices
    })
    }
    res.status(200).json({
        status :"success",
        payload :services
    })
})
