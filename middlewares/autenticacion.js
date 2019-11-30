var jwt = require('jsonwebtoken');

const SEED = require('../config/config').SEED;

// ====================================
// Verificar token
// ====================================

exports.verificaToken = function (req, res, next) {

    let token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token Incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;
        next();

        //return res.status(200).json({
        //    ok: true,
        //    decoded
        //});

    });

}