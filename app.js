// Requires
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

//const bodyParser = require('body-parser');


//Inicializar Variables
const app = express();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(morgan('dev'));
app.use(cors());

//parse application/x-www-form-urlencoded
//app.use(bodyParser.urlencoded({ extended: false }));
//parse application/json
//app.use(bodyParser.json());


//importar rutas
const route = require('./routes/app.routes');

const routeUsuario = require('./routes/usuario.routes');
const loginUsuario = require('./routes/login.routes');


//conexion a base de datos
mongoose.connect('mongodb://localhost/hospitalDB', {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}, (err, res) => {
    if (err) throw err;
    console.log('Conectado a base de datos');
});

//rutas
app.use('/api/adminpro/usuario', routeUsuario);
app.use('/api/adminpro/usuario/login', loginUsuario);

app.use('/api/adminpro', route);


// Escuchar peticiones
app.listen(3000, () => {
    console.log('En puerto 3000: \x1b[41m%s\x1b[0m', 'online');
});