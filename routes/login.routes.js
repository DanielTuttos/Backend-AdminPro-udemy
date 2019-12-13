const express = require('express');

const bcryptjs = require('bcryptjs');

const app = express();

const Usuario = require('../models/usuario.model');

var jwt = require('jsonwebtoken');

const SEED = require('../config/config').SEED;

//google
const CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// ====================================
// Autenticacion de login
// ====================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,

    }
}

app.post('/google', async (req, res) => {

    let token = req.body.token;

    let googleUser = await verify(token)
        .catch(e => {
            res.status(403).json({
                ok: false,
                mensaje: 'Token no valido'
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticacion normal'
                });
            } else {
                let token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 2000000 })

                res.status(201).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            }
        } else {
            // elusuario no existe... hay que crearlo
            let usuario = new Usuario({
                nombre: googleUser.nombre,
                email: googleUser.email,
                img: googleUser.img,
                google: true,
                password: ':)'
            });

            usuario.save((err, usuarioDB) => {

                let token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 2000000 })

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            });


        }

    });

    //res.status(200).json({
    //    ok: true,
    //    mensaje: 'ok',
    //    googleUser
    //});
});


// ====================================
// Metodo de login normal
// ====================================

app.post('/', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email'
            });
        }

        if (!bcryptjs.compareSync(body.password, usuarioDB.password)) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password'
            });
        }

        //crear token
        usuarioDB.password = ':)';
        let token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 2000000 })

        res.status(201).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });
});


module.exports = app;