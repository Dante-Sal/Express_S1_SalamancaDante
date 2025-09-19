require('dotenv').config();
const { Router } = require('express');
const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const { CamperController } = require('../controllers/camperController');

const campers = Router();
const camperController = new CamperController();

passport.use(new Strategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    },
    async (payload, done) => {
        try {
            return done(null, payload);
        } catch (err) {
            return done(err, false);
        };
    }
));

const authMiddleware = (req, res, next) => passport.authenticate(`jwt`, { session: false }, (err, camper, info) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!camper) return res.status(401).json({ error: `acceso denegado (fallo en la autenticación por token de acceso)`, info: info.message });

    req.camper = camper;
    next();
})(req, res, next);

/**
 * @swagger
 * components:
 *   schemas:
 *     camper:
 *       type: object
 *       required:
 *         - _id
 *         - estado
 *         - riesgo
 *         - email
 *         - contrasena
 *       properties:
 *         _id:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'
 *           description: El ID auto-generado del camper.
 *         estado:
 *           type: string
 *           enum: 
 *             - En proceso de ingreso
 *             - Inscrito
 *             - Aprobado
 *             - Cursando
 *             - Graduado
 *             - Retirado
 *             - Expulsado
 *           description: El estado actual del camper.
 *         riesgo:
 *           type: string
 *           enum:
 *             - Bajo
 *             - Medio
 *             - Alto
 *           description: El riesgo actual del camper (a más alto, mayor probabilidad de pérdida de la beca).
 *         nombres:
 *           type: string
 *           pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *           description: El nombre/s del camper (se admiten máximo 2 por cada uno).
 *         apellidos:
 *           type: string
 *           pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *           description: Los apellidos del camper (se admiten únicamente 2 por cada uno).
 *         direccion:
 *           type: string
 *           pattern: '^\S[\s\S]*\S$'
 *           description: La dirección del domicilio del camper (este campo no puede estar vacío).
 *         email:
 *           type: string
 *           pattern: '^(?!.*\.\.)([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9._+-]*[a-zA-Z0-9])@([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9])\.[a-zA-Z]{2,}$'
 *           description: La dirección de correo electrónico del camper (se admiten formatos válidos de correo electrónico).
 *         telefono:
 *           type: string
 *           pattern: '^3[0-9]{9}$'
 *           description: El número de teléfono del camper (debe iniciar con el dígito 3 y tener una longitud de 10 caracteres).
 *         acudiente:
 *           type: object
 *           properties:
 *             nombres:
 *               type: string
 *               pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *               description: El nombre/s del acudiente del camper (se admiten máximo 2 por cada uno).
 *             apellidos:
 *               type: string
 *               pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *               description: Los apellidos del acudiente del camper (se admiten únicamente 2 por cada uno).
 *             telefono:
 *               type: string
 *               pattern: '^3[0-9]{9}$'
 *               description: El número de teléfono del acudiente del camper (debe iniciar con el dígito 3 y tener una longitud de 10 caracteres).
 *           additionalProperties: false
 *         jornada:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *           description: El número de la jornada en la cual estudia el camper (debe estar dentro del rango 1-4).
 *         contrasena:
 *           type: string
 *           pattern: '^\S{8,}$'
 *           description: La contraseña del camper (debe tener una longitud mínima de 8 caracteres; se almacena hasheada).
 *       additionalProperties: false
 *       example:
 *         _id: 60d1e6c2a7b3b9d6c7a5b8a0
 *         estado: Inscrito
 *         riesgo: Bajo
 *         nombres: Camper Nombre
 *         apellidos: Camper Apellido
 *         direccion: 'Calle Ejemplo # 50 - 53'
 *         email: camper@ejemplo.com
 *         telefono: '3000000000'
 *         acudiente: 
 *           nombres: Acudiente Nombre
 *           apellidos: Acudiente Apellido
 *           telefono: '3100000000'
 *         jornada: 1
 *         contrasena: contraseñaSegura123
 *     error:
 *       type: object
 *       required:
 *         - error
 *       properties:
 *         error:
 *           type: string
 *           pattern: '^\S[\s\S]*\S$'
 *           description: Descripción del error.
 *       additionalProperties: false
 *     message:
 *       type: string
 *       pattern: '^\S[\s\S]*\S$'
 *       description: Descripción de la respuesta de la solicitud.
 *     count:
 *       type: object
 *       required:
 *         - msg
 *         - total
 *       properties:
 *         msg:
 *           $ref: '#/components/schemas/message'
 *         total:
 *           type: integer
 *           description: Cantidad total de campers registrados en la base de datos.
 *       additionalProperties: false
 *       example:
 *         total: 1
 *     publicCamper:
 *       type: object
 *       required:
 *         - _id
 *         - email
 *       properties:
 *         _id:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'
 *           description: El ID auto-generado del camper.
 *         nombres:
 *           type: string
 *           pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *           description: El nombre/s del camper (se admiten máximo 2 por cada uno).
 *         apellidos:
 *           type: string
 *           pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *           description: Los apellidos del camper (se admiten únicamente 2 por cada uno).
 *         direccion:
 *           type: string
 *           pattern: '^\S[\s\S]*\S$'
 *           description: La dirección del domicilio del camper (este campo no puede estar vacío).
 *         email:
 *           type: string
 *           pattern: '^(?!.*\.\.)([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9._+-]*[a-zA-Z0-9])@([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9])\.[a-zA-Z]{2,}$'
 *           description: La dirección de correo electrónico del camper (se admiten formatos válidos de correo electrónico).
 *         telefono:
 *           type: string
 *           pattern: '^3[0-9]{9}$'
 *           description: El número de teléfono del camper (debe iniciar con el dígito 3 y tener una longitud de 10 caracteres).
 *         acudiente:
 *           type: object
 *           properties:
 *             nombres:
 *               type: string
 *               pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *               description: El nombre/s del acudiente del camper (se admiten máximo 2 por cada uno).
 *             apellidos:
 *               type: string
 *               pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *               description: Los apellidos del acudiente del camper (se admiten únicamente 2 por cada uno).
 *             telefono:
 *               type: string
 *               pattern: '^3[0-9]{9}$'
 *               description: El número de teléfono del acudiente del camper (debe iniciar con el dígito 3 y tener una longitud de 10 caracteres).
 *           additionalProperties: false        
 *         jornada:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *           description: El número de la jornada en la cual estudia el camper (debe estar dentro del rango 1-4).
 *       additionalProperties: false
 *       example:
 *         _id: 60d1e6c2a7b3b9d6c7a5b8a0
 *         nombres: Camper Nombre
 *         apellidos: Camper Apellido
 *         direccion: 'Calle Ejemplo # 50 - 53'
 *         email: camper@ejemplo.com
 *         telefono: '3000000000'
 *         acudiente: 
 *           nombres: Acudiente Nombre
 *           apellidos: Acudiente Apellido
 *           telefono: '3100000000'
 *         jornada: 1
 *     registrationStartCamper:
 *       type: object
 *       required:
 *         - email
 *         - contrasena
 *       properties:
 *         nombres:
 *           type: string
 *           pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *           description: El nombre/s del camper (se admiten máximo 2 por cada uno).
 *         apellidos:
 *           type: string
 *           pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *           description: Los apellidos del camper (se admiten únicamente 2 por cada uno).
 *         direccion:
 *           type: string
 *           pattern: '^\S[\s\S]*\S$'
 *           description: La dirección del domicilio del camper (este campo no puede estar vacío).
 *         email:
 *           type: string
 *           pattern: '^(?!.*\.\.)([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9._+-]*[a-zA-Z0-9])@([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9])\.[a-zA-Z]{2,}$'
 *           description: La dirección de correo electrónico del camper (se admiten formatos válidos de correo electrónico).
 *         telefono:
 *           type: string
 *           pattern: '^3[0-9]{9}$'
 *           description: El número de teléfono del camper (debe iniciar con el dígito 3 y tener una longitud de 10 caracteres).
 *         acudiente:
 *           type: object
 *           properties:
 *             nombres:
 *               type: string
 *               pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *               description: El nombre/s del acudiente del camper (se admiten máximo 2 por cada uno).
 *             apellidos:
 *               type: string
 *               pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *               description: Los apellidos del acudiente del camper (se admiten únicamente 2 por cada uno).
 *             telefono:
 *               type: string
 *               pattern: '^3[0-9]{9}$'
 *               description: El número de teléfono del acudiente del camper (debe iniciar con el dígito 3 y tener una longitud de 10 caracteres).
 *           additionalProperties: false        
 *         jornada:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *           description: El número de la jornada en la cual estudia el camper (debe estar dentro del rango 1-4).
 *         contrasena:
 *           type: string
 *           pattern: '^\S{8,}$'
 *           description: La contraseña del camper (debe tener una longitud mínima de 8 caracteres; se almacena hasheada).
 *       additionalProperties: false
 *       example:
 *         nombres: Camper Nombre
 *         apellidos: Camper Apellido
 *         direccion: 'Calle Ejemplo # 50 - 53'
 *         email: camper@ejemplo.com
 *         telefono: '3000000000'
 *         acudiente: 
 *           nombres: Acudiente Nombre
 *           apellidos: Acudiente Apellido
 *           telefono: '3100000000'
 *         jornada: 1
 *         contrasena: contraseñaSegura123
 *     loginCredentials:
 *       type: object
 *       required:
 *         - email
 *         - contrasena
 *       properties:
 *         email:
 *           type: string
 *           pattern: '^(?!.*\.\.)([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9._+-]*[a-zA-Z0-9])@([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9])\.[a-zA-Z]{2,}$'
 *           description: La dirección de correo electrónico del camper (se admiten formatos válidos de correo electrónico).
 *         contrasena:
 *           type: string
 *           pattern: '^\S{8,}$'
 *           description: La contraseña del camper (debe tener una longitud mínima de 8 caracteres).
 *       additionalProperties: false
 *       example:
 *         email: camper@ejemplo.com
 *         contrasena: contraseñaSegura123
 *     registrationContinuationCamper:
 *       type: object
 *       properties:
 *         nombres:
 *           type: string
 *           pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *           description: El nombre/s del camper (se admiten máximo 2 por cada uno).
 *         apellidos:
 *           type: string
 *           pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *           description: Los apellidos del camper (se admiten únicamente 2 por cada uno).
 *         direccion:
 *           type: string
 *           pattern: '^\S[\s\S]*\S$'
 *           description: La dirección del domicilio del camper (este campo no puede estar vacío).
 *         telefono:
 *           type: string
 *           pattern: '^3[0-9]{9}$'
 *           description: El número de teléfono del camper (debe iniciar con el dígito 3 y tener una longitud de 10 caracteres).
 *         acudiente:
 *           type: object
 *           properties:
 *             nombres:
 *               type: string
 *               pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *               description: El nombre/s del acudiente del camper (se admiten máximo 2 por cada uno).
 *             apellidos:
 *               type: string
 *               pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *               description: Los apellidos del acudiente del camper (se admiten únicamente 2 por cada uno).
 *             telefono:
 *               type: string
 *               pattern: '^3[0-9]{9}$'
 *               description: El número de teléfono del acudiente del camper (debe iniciar con el dígito 3 y tener una longitud de 10 caracteres).
 *           additionalProperties: false
 *         jornada:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *           description: El número de la jornada en la cual estudia el camper (debe estar dentro del rango 1-4).
 *       additionalProperties: false
 *       example:
 *         nombres: Camper Nombre
 *         apellidos: Camper Apellido
 *         direccion: 'Calle Ejemplo # 50 - 53'
 *         telefono: '3000000000'
 *         acudiente: 
 *           nombres: Acudiente Nombre
 *           apellidos: Acudiente Apellido
 *           telefono: '3100000000'
 *         jornada: 1
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: campers
 *   description: Gestionamiento de campers.
 */

/**
 * @swagger
 * /campers:
 *   get:
 *     summary: Retorna una lista de todos los campers registrados en la base de datos.
 *     tags: [campers]
 *     responses:
 *       200:
 *         description: La lista de campers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - msg
 *                 - campers
 *               properties:
 *                 msg:
 *                   $ref: '#/components/schemas/message'
 *                 campers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/publicCamper'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/error'
 */

campers.get(`/`, (req, res) => camperController.list(req, res));

/**
 * @swagger
 * /campers/count:
 *   get:
 *     summary: Retorna un objeto 'total' que contiene la cantidad de campers registrados en la base de datos.
 *     tags: [campers]
 *     responses:
 *       200:
 *         description: El total de campers.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/count'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 */

campers.get(`/count`, (req, res) => camperController.count(req, res));

/**
 * @swagger
 * /campers/{id}:
 *   get:
 *     operationId: findById
 *     summary: Retorna el camper con el ID especificado por parámetros.
 *     tags: [campers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del camper.
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'
 *     responses:
 *       200:
 *         description: El camper solicitado por ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - msg
 *                 - camper
 *               properties:
 *                 msg:
 *                   $ref: '#/components/schemas/message'
 *                 camper:
 *                   $ref: '#/components/schemas/publicCamper'
 *       400:
 *         description: Error por solicitud inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       404:
 *         description: Error por camper no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 */

campers.get(`/:id`, (req, res) => camperController.findById(req, res));

/**
 * @swagger
 * /campers/register:
 *   post:
 *     summary: Registra nuevos campers en la base de datos (admite cuerpos de solicitud incompletos que se consideran como alumnos 'En proceso de ingreso').
 *     tags: [campers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/registrationStartCamper'
 *     responses:
 *       201:
 *         description: El camper registrado.
 *         headers:
 *           Location:
 *             description: URL del camper registrado.
 *             schema:
 *               type: string
 *               format: uri-reference
 *             example: /campers/60d1e6c2a7b3b9d6c7a5b8a0
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - msg
 *                 - response
 *                 - data
 *               properties:
 *                 msg:
 *                   $ref: '#/components/schemas/message'
 *                 response:
 *                   type: object
 *                   required:
 *                     - acknowledged
 *                     - insertedId
 *                   properties:
 *                     acknowledged:
 *                       type: boolean
 *                     insertedId:
 *                       type: string
 *                       pattern: '^[a-fA-F0-9]{24}$'
 *                       example: 60d1e6c2a7b3b9d6c7a5b8a0
 *                 data:
 *                   $ref: '#/components/schemas/publicCamper'
 *         links:
 *           GetCamperById:
 *             description: Retorna el camper registrado.
 *             operationId: findById
 *             parameters:
 *               id: '$response.body#/_id'
 *       400:
 *         description: Error por solicitud inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 */

campers.post(`/register`, (req, res) => camperController.register(req, res));

/**
 * @swagger
 * /campers/login:
 *   post:
 *     summary: Inicia sesión con las credenciales de campers registrados en la base de datos (retorna un token de acceso que permite la ejecución de acciones que necesiten autenticación).
 *     tags: [campers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/loginCredentials'
 *     responses:
 *       202:
 *         description: El token de acceso que permitirá la ejecución de determinadas acciones.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - msg
 *                 - token
 *                 - expiresIn
 *               properties:
 *                 msg:
 *                   $ref: '#/components/schemas/message'
 *                 token:
 *                   type: string
 *                   pattern: '^[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+$'
 *                   readOnly: true
 *                 expiresIn:
 *                   type: string
 *                   pattern: '^(0|[1-9][0-9]{0,9})(ms|[dhmswy])$'
 *       401:
 *         description: Error por fallo en la verificación de credenciales.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       404:
 *         description: Error por camper no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 */

campers.post(`/login`, (req, res) => camperController.login(req, res));

/**
 * @swagger
 * /campers/continue/{id}:
 *   patch:
 *     summary: Continúa con el registro de campers 'En proceso de ingreso'.
 *     tags: [campers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del camper.
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/registrationContinuationCamper'
 *     responses:
 *       200:
 *         description: El camper actualizado con los nuevos datos ingresados.
 *         headers:
 *           Location:
 *             description: URL del camper registrado.
 *             schema:
 *               type: string
 *               format: uri-reference
 *             example: /campers/60d1e6c2a7b3b9d6c7a5b8a0
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - msg
 *                 - response
 *                 - data
 *               properties:
 *                 msg:
 *                   $ref: '#/components/schemas/message'
 *                 response:
 *                   type: object
 *                   required:
 *                     - acknowledged
 *                     - matchedCount
 *                     - modifiedCount
 *                   properties:
 *                     acknowledged:
 *                       type: boolean
 *                     matchedCount:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 1
 *                     modifiedCount:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 1
 *                 data:
 *                   $ref: '#/components/schemas/publicCamper'
 *         links:
 *           GetCamperById:
 *             description: Retorna el camper actualizado.
 *             operationId: findById
 *             parameters:
 *               id: '$response.body#/_id'
 *       400:
 *         description: Error por solicitud inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       404:
 *         description: Error por camper no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 */

campers.patch('/continue/:id', authMiddleware, (req, res) => camperController.continue(req, res));

module.exports = { campers };