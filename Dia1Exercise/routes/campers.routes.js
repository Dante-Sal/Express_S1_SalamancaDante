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
 *         - estado
 *         - riesgo
 *       properties:
 *         _id:
 *           type: integer
 *           minimum: 1
 *           description: El ID auto-generado del camper/estudiante.
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
 *           description: El estado actual del camper/estudiante.
 *         riesgo:
 *           type: string
 *           enum:
 *             - Bajo
 *             - Medio
 *             - Alto
 *           description: El riesgo actual del camper/estudiante (a más alto, mayor probabilidad de pérdida de la beca).
 *         nombres:
 *           type: string
 *           pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *           description: El nombre/s del camper/estudiante (se admiten máximo 2 por cada uno).
 *         apellidos:
 *           type: string
 *           pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *           description: Los apellidos del camper/estudiante (se admiten únicamente 2 por cada uno).
 *         direccion:
 *           type: string
 *           pattern: '^\S[\s\S]*\S$'
 *           description: La dirección del domicilio del camper/estudiante (este campo no puede estar vacío).
 *         telefono:
 *           type: string
 *           pattern: '^3[0-9]{9}$'
 *           description: El número de teléfono del camper/estudiante (debe iniciar con el dígito 3 y tener una longitud de 10 caracteres).
 *         acudiente:
 *           type: object
 *           properties:
 *             nombres:
 *               type: string
 *               pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *               description: El nombre/s del acudiente del camper/estudiante (se admiten máximo 2 por cada uno).
 *             apellidos:
 *               type: string
 *               pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *               description: Los apellidos del acudiente del camper/estudiante (se admiten únicamente 2 por cada uno).
 *             telefono:
 *               type: string
 *               pattern: '^3[0-9]{9}$'
 *               description: El número de teléfono del acudiente del camper/estudiante (debe iniciar con el dígito 3 y tener una longitud de 10 caracteres).
 *           additionalProperties: false
 *         jornada:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *           description: El número de la jornada en la cual estudia el camper/estudiante (debe estar dentro del rango 1-4).
 *       additionalProperties: false
 *       example:
 *         _id: 1
 *         estado: Inscrito
 *         riesgo: Bajo
 *         nombres: Camper Nombre
 *         apellidos: Camper Apellido
 *         direccion: 'Calle Ejemplo # 50 - 53'
 *         telefono: '3000000000'
 *         acudiente: 
 *           nombres: Acudiente Nombre
 *           apellidos: Acudiente Apellido
 *           telefono: '3000000001'
 *         jornada: 1
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
 *     camperId:
 *       type: object
 *       required:
 *         - _id
 *       properties:
 *         _id:
 *           type: integer
 *           minimum: 1
 *           description: El ID auto-generado del camper/estudiante.
 *       additionalProperties: false
 *     count:
 *       type: object
 *       required:
 *         - total
 *       properties:
 *         total:
 *           type: integer
 *           description: Cantidad total de campers/estudiantes registrados en la base de datos.
 *       additionalProperties: false
 *       example:
 *         total: 1
 *     registrationCamper:
 *       type: object
 *       properties:
 *         nombres:
 *           type: string
 *           pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *           description: El nombre/s del camper/estudiante (se admiten máximo 2 por cada uno).
 *         apellidos:
 *           type: string
 *           pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *           description: Los apellidos del camper/estudiante (se admiten únicamente 2 por cada uno).
 *         direccion:
 *           type: string
 *           pattern: '^\S[\s\S]*\S$'
 *           description: La dirección del domicilio del camper/estudiante (este campo no puede estar vacío).
 *         telefono:
 *           type: string
 *           pattern: '^3[0-9]{9}$'
 *           description: El número de teléfono del camper/estudiante (debe iniciar con el dígito 3 y tener una longitud de 10 caracteres).
 *         acudiente:
 *           type: object
 *           properties:
 *             nombres:
 *               type: string
 *               pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *               description: El nombre/s del acudiente del camper/estudiante (se admiten máximo 2 por cada uno).
 *             apellidos:
 *               type: string
 *               pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *               description: Los apellidos del acudiente del camper/estudiante (se admiten únicamente 2 por cada uno).
 *             telefono:
 *               type: string
 *               pattern: '^3[0-9]{9}$'
 *               description: El número de teléfono del acudiente del camper/estudiante (debe iniciar con el dígito 3 y tener una longitud de 10 caracteres).
 *           additionalProperties: false        
 *         jornada:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *           description: El número de la jornada en la cual estudia el camper/estudiante (debe estar dentro del rango 1-4).
 *       additionalProperties: false
 *       example:
 *         nombres: Camper Nombre
 *         apellidos: Camper Apellido
 *         direccion: 'Calle Ejemplo # 50 - 53'
 *         telefono: '3000000000'
 *         acudiente: 
 *           nombres: Acudiente Nombre
 *           apellidos: Acudiente Apellido
 *           telefono: '3000000001'
 *         jornada: 1
 *     registrationContinuationCamper:
 *       type: object
 *       required:
 *         - _id
 *       properties:
 *         _id:
 *           type: integer
 *           minimum: 1
 *           description: El ID auto-generado del camper/estudiante.
 *         nombres:
 *           type: string
 *           pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *           description: El nombre/s del camper/estudiante (se admiten máximo 2 por cada uno).
 *         apellidos:
 *           type: string
 *           pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *           description: Los apellidos del camper/estudiante (se admiten únicamente 2 por cada uno).
 *         direccion:
 *           type: string
 *           pattern: '^\S[\s\S]*\S$'
 *           description: La dirección del domicilio del camper/estudiante (este campo no puede estar vacío).
 *         telefono:
 *           type: string
 *           pattern: '^3[0-9]{9}$'
 *           description: El número de teléfono del camper/estudiante (debe iniciar con el dígito 3 y tener una longitud de 10 caracteres).
 *         acudiente:
 *           type: object
 *           properties:
 *             nombres:
 *               type: string
 *               pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *               description: El nombre/s del acudiente del camper/estudiante (se admiten máximo 2 por cada uno).
 *             apellidos:
 *               type: string
 *               pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'
 *               description: Los apellidos del acudiente del camper/estudiante (se admiten únicamente 2 por cada uno).
 *             telefono:
 *               type: string
 *               pattern: '^3[0-9]{9}$'
 *               description: El número de teléfono del acudiente del camper/estudiante (debe iniciar con el dígito 3 y tener una longitud de 10 caracteres).
 *           additionalProperties: false
 *         jornada:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *           description: El número de la jornada en la cual estudia el camper/estudiante (debe estar dentro del rango 1-4).
 *       additionalProperties: false
 *       example:
 *         _id: 1
 *         nombres: Camper Nombre
 *         apellidos: Camper Apellido
 *         direccion: 'Calle Ejemplo # 50 - 53'
 *         telefono: '3000000000'
 *         acudiente: 
 *           nombres: Acudiente Nombre
 *           apellidos: Acudiente Apellido
 *           telefono: '3000000001'
 *         jornada: 1
 */

/**
 * @swagger
 * tags:
 *   name: campers
 *   description: Gestionamiento de campers/estudiantes.
 */

/**
 * @swagger
 * /campers:
 *   get:
 *     summary: Retorna una lista de todos los campers/estudiantes registrados en la base de datos
 *     tags: [campers]
 *     responses:
 *       200:
 *         description: La lista de campers/estudiantes.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/camper'
 *       500:
 *         description: Error de base de datos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/error'
 */

campers.get(`/`, ctrl.list);

/**
 * @swagger
 * /campers/count:
 *   get:
 *     summary: Retorna un objeto 'total' que contiene la cantidad de campers/estudiantes registrados en la base de datos
 *     tags: [campers]
 *     responses:
 *       200:
 *         description: El total de campers/estudiantes.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/count'
 *       500:
 *         description: Error de base de datos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 */

campers.get(`/count`, ctrl.count);

/**
 * @swagger
 * /campers/{id}:
 *   get:
 *     operationId: getByParamsId
 *     summary: Retorna el camper/estudiante con el ID especificado por parámetros
 *     tags: [campers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID numérico del camper/estudiante.
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: El camper/estudiante solicitado por ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/camper'
 *       400:
 *         description: Error por solicitud inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       404:
 *         description: Error por camper/estudiante no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       500:
 *         description: Error de base de datos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 */

campers.get(`/:id`, ctrl.getByParamsId);

/**
 * @swagger
 * /camper:
 *   post:
 *     summary: Retorna el camper/estudiante con el ID especificado por body
 *     tags: [campers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/camperId'
 *     responses:
 *       200:
 *         description: El camper/estudiante solicitado por ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/camper'
 *       400:
 *         description: Error por solicitud inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       404:
 *         description: Error por camper/estudiante no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       500:
 *         description: Error de base de datos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 */

camper.post(`/`, ctrl.getByBodyId);

/**
 * @swagger
 * /campers/register:
 *   post:
 *     summary: Registra nuevos campers/estudiantes en la base de datos (admite cuerpos de solicitud incompletos que se consideran como alumnos 'En proceso de ingreso')
 *     tags: [campers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/registrationCamper'
 *     responses:
 *       201:
 *         description: El camper/estudiante registrado.
 *         headers:
 *           Location:
 *             description: URL del camper registrado.
 *             schema:
 *               type: string
 *               format: uri-reference
 *             example: /campers/1
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/camper'
 *         links:
 *           GetCamperById:
 *             description: Retorna el camper/estudiante registrado.
 *             operationId: getByParamsId
 *             parameters:
 *               id: '$response.body#/_id'
 *       400:
 *         description: Error por solicitud inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       500:
 *         description: Error de base de datos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 */

campers.post(`/register`, ctrl.startRegistration);

/**
 * @swagger
 * /campers/continue:
 *   patch:
 *     summary: Continúa con el registro de campers/estudiantes 'En proceso de ingreso'
 *     tags: [campers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/registrationContinuationCamper'
 *     responses:
 *       200:
 *         description: El camper/estudiante actualizado con los nuevos datos ingresados.
 *         headers:
 *           Location:
 *             description: URL del camper registrado.
 *             schema:
 *               type: string
 *               format: uri-reference
 *             example: /campers/1
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/camper'
 *         links:
 *           GetCamperById:
 *             description: Retorna el camper/estudiante actualizado.
 *             operationId: getByParamsId
 *             parameters:
 *               id: '$response.body#/_id'
 *       400:
 *         description: Error por solicitud inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       404:
 *         description: Error por camper/estudiante no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       500:
 *         description: Error de base de datos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 */

campers.patch('/continue', ctrl.continueRegistration);

module.exports = { campers, camper };