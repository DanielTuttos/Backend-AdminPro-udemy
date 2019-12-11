
const express = require('express');

const bcryptjs = require('bcryptjs');

const app = express();

const Usuario = require('../models/usuario.model');

const verificaToken = require('../middlewares/autenticacion').verificaToken;

// ====================================
// Obtener todos los usuarios
// ====================================

app.get('/', (req, res, next) => {

    let desde = req.query.desde || 0;

    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar los usuarios',
                    errors: err
                });
            }

            Usuario.countDocuments({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    total: conteo,
                    usuarios
                });
            });

        });
});

// ====================================
// Verificar token
// ====================================
// esto funciona pero no es la mejor opcion
//app.use('/', (req, res, next) => {
//    let token = req.query.token;
//    jwt.verify(token, SEED, (err, decoded) => {
//
//        if (err) {
//            return res.status(401).json({
//                ok: false,
//                mensaje: 'Token Incorrecto',
//                errors: err
//            });
//        }
//
//        next();
//
//    })
//});

// ====================================
// Crear un nuevo usuario
// ====================================

app.post('/', verificaToken, (req, res) => {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcryptjs.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });
});

// ====================================
// Actualizar Usuario
// ====================================

app.put('/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    let body = req.body;

    Usuario.findByIdAndUpdate(id, body, { new: true }, (err, usuarioActualizado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al actualizar usuario',
                errors: err
            });
        }
        if (!usuarioActualizado) {
            return res.status(400).json({
                ok: false,
                errors: err
            });
        }

        usuarioActualizado.password = ':)';

        res.status(201).json({
            ok: true,
            usuario: usuarioActualizado
        });
    });
});

// ====================================
// Elimina un usuario
// ====================================

app.delete('/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Usuario.findByIdAndDelete(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});




module.exports = app;
