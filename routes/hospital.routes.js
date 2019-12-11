const express = require('express');

const app = express();

const Hospital = require('../models/hospital.model');

const verificaToken = require('../middlewares/autenticacion').verificaToken;

// ====================================
// Obtener todos los hospitales
// ====================================
app.get('/', (req, res) => {

    let desde = req.query.desde || 0;

    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar los hospitales',
                    errors: err
                });
            }

            Hospital.countDocuments({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    total: conteo,
                    hospitales
                });
            });

        });

});

// ====================================
// Crea un hospital nuevo
// ====================================

app.post('/', verificaToken, (req, res) => {

    let body = req.body;

    let hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al guardar la informacion de hospital',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});


// ====================================
// Actualizar Hospital
// ====================================

app.put('/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    let body = req.body;

    Hospital.findByIdAndUpdate(id, { nombre: body.nombre, usuario: req.usuario._id }, { new: true }, (err, hospitalActializado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al actualizar la informacion de hospital',
                errors: err
            });
        }

        if (!hospitalActializado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id'
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalActializado
        });
    });

});

// ====================================
// Elimina un hospital
// ====================================

app.delete('/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Hospital.findByIdAndDelete(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',

            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    })

})


module.exports = app;