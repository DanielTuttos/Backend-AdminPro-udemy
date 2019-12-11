const express = require('express');

const app = express();

const Medico = require('../models/medico.model');

const verificaToken = require('../middlewares/autenticacion').verificaToken;

// ====================================
// Obtener lista de todos los medicos
// ====================================

app.get('/', (req, res) => {

    let desde = req.query.desde || 0;

    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar los medicos',
                    errors: err
                });
            }

            Medico.countDocuments({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    total: conteo,
                    medicos
                });
            });
        });
});

// ====================================
// Crear un medico 
// ====================================

app.post('/', verificaToken, (req, res) => {

    let body = req.body;

    let medico = new Medico({
        nombre: body.nombre,
        hospital: body.hospital,
        usuario: req.usuario._id
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al guardar la informacion del medico',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoGuardado,
            usuarioToken: req.usuario
        });
    });
});

// ====================================
// actualiza la informacion de medico
// ====================================

app.put('/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    let body = req.body;

    Medico.findByIdAndUpdate(id, body, { new: true }, (err, medicoActualizado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al actualizar la informacion del medico',
                errors: err
            });
        }

        if (!medicoActualizado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id'
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoActualizado
        });
    });
});


// ====================================
// Eliminar un medico
// ====================================

app.delete('/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Medico.findByIdAndDelete(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',

            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});




module.exports = app;