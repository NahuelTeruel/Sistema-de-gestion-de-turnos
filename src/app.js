import express from 'express';
import config from './config/config.js';

const PORT = config.port;

const app = express();

// Middleware para parsear el body de las solicitudes JSON
// El orden es importante, debe ir antes de las rutas, porque se ejecuta en orden
app.use(express.json());

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


//GET api/services/:sid
app.get('/api/services/:sid', (req, res) => {
    const id = Number(req.params.sid)
    
    const service = services.find(
        service => service.id === id)
    //si el servicio no existe, devolvemos un error 404
    if (!service){
        return res.status(404).json({
            status:"error",
            payload: "Servicio no encontrado"
        })
    }
    res.status(200).json({
        status:"success",
        payload: service
    })
})

//POST api/services
app.post('/api/services', (req, res) => {
   
    const {name, description, price, duration, available, category} = req.body 

    if (!name || !price || !duration || !category){
        return res.status(400).json({
            status:"error",
            payload: "Faltan datos obligatorios"
        })
    }
    const newService = {
        id: services.length + 1,
        name,
        description,
        price,
        duration,
        available : available ?? true,
        category
    }
    services.push(newService)
    res.status(201).json({
        status:"success",
        payload: newService
    })
})

//PUT api/services/:sid
app.put('/api/services/:sid', (req, res) => {
    const id = Number(req.params.sid)  
    const serviceIndex = services.findIndex(
        service => service.id === id
    )
    if (serviceIndex === -1){
        return res.status(404).json({
            status:"error",
            payload: "Servicio no encontrado"
        })
    }
    const {name, description, price, duration, available, category} = req.body
    if (!name || !price || !duration || !category){
        return res.status(400).json({
            status:"error",
            payload: "Faltan datos obligatorios"
        })
    } 
    services[serviceIndex] = {
        id,
        name,
        description,
        price,
        duration,
        available,
        category
    }
    res.status(200).json({
        status:"success",
        message: "Servicio actualizado correctamente",
        payload: services[serviceIndex]
    })
})

//DELETE api/services/:id

app.delete("/api/services/:sid",(req,res)=>{
    const id = Number(req.params.sid)

    const serviceIndex = services.findIndex(
        service => service.id === id
    )

    if (serviceIndex === -1){
        return res.status(404).json({
            status:"error",
            message: "Servicio no encontrado"
        })
    }

    const deleteService = services.splice(serviceIndex,1)

    res.status(200).json({
        status:"success",
        message :"Servicio eliminado correctamente",
        payload :deleteService[0]
    })

})