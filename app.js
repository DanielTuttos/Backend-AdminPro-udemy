// Requires
const express = require('express');
const mongoose = require('mongoose');


//Inicializar Variables
const app = express();

//conexion a base de datos
mongoose.connection.openUri('mongodb://localhost/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Conectado a base de datos');
})

//rutas

app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'hola mundo peticion get correcta'
    });
})


// Escuchar peticiones
app.listen(3000, () => {
    console.log('En puerto 3000: \x1b[41m%s\x1b[0m', 'online');
})