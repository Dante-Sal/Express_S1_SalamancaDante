const { Router } = require('express');
const ctrl = require('../controllers/campers.controller');

const campers = Router();
const camper = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     camper:
 *       type: object
 *       required:
 *         - _id
 *       properties:
 *         _id:
 *           type: integer
 *           description: El ID auto-generado del camper/estudiante
 *         nombres:
 *           type: string
 *           description: El nombre/s del camper/estudiante, se admiten máximo 2 por cada uno
 *         apellidos:
 *           type: string
 *           description: Los apellidos del camper/estudiante, se admiten únicamente 2 por cada uno
 *         direccion:
 *           type: string
 *           description: La dirección del domicilio del camper/estudiante, este campo no puede estar vacío
 *         telefono:
 *           type: string
 *           description: El número de teléfono del camper/estudiante, debe iniciar con el dígito 3 y tener una longitud de 10 caracteres
 *         acudiente:
 *           type: object
 *           properties:
 *             nombres:
 *               type: string
 *               description: El nombre/s del acudiente del camper/estudiante, se admiten máximo 2 por cada uno
 *             apellidos:
 *               type: string
 *               description: Los apellidos del acudiente del camper/estudiante, se admiten únicamente 2 por cada uno
 *             telefono:
 *               type: string
 *               description: El número de teléfono del acudiente del camper/estudiante, debe iniciar con el dígito 3 y tener una longitud de 10 caracteres
 *         jornada:
 *           type: integer
 *           description: El número de la jornada en la cual estudia el camper/estudiante, debe estar dentro del rango 1-4
 *       example:
 *         _id: 1
 *         nombres: Camper Nombre
 *         apellidos: Camper Apellido
 *         direccion: "Calle Ejemplo # 50 - 53"
 *         telefono: 3000000000
 *         acudiente: 
 *           nombres: Acudiente Nombre
 *           apellidos: Acudiente Apellido
 *           telefono: 3000000001
 *         jornada: 1
 */

/**
 * @swagger
 * tags:
 *   name: campers
 *   description: Endpoints de gestionamiento de campers/estudiantes
 */

/**
 * @swagger
 * /campers:
 *   get:
 *     summary: Retorna una lista de todos los campers/estudiantes registrados en la base de datos
 *     tags: [campers]
 *     responses:
 *       200:
 *         description: La lista de campers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/camper'
 *       500:
 *         description: Error de base de datos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - error
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Descripción del error
 */

campers.get('/', ctrl.list);
campers.get('/count', ctrl.count);
campers.get('/:id', ctrl.getByParamsId);
camper.post('/', ctrl.getByBodyId);
campers.post('/', ctrl.startRegistration);
campers.patch('/continue', ctrl.continueRegistration);

module.exports = { campers, camper };