const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'API Sistema Campuslands',
            version: '1.0.0',
            description: 'API de gestionamiento del sistema de bases de datos de Campuslands. Enfocada principalmente en operaciones de carácter CRUD (creación, lectura, actualización y eliminación) sobre los distintos recursos de la plataforma: campers/estudiantes, trainers/docente, administradores, skills/asignaturas, rutas de aprendizaje, notas, grupos, entre otros. Su finalidad es centralizar el acceso a la información de estos recursos y ofrecer endpoints claros para realizar las operaciones CRUD de forma uniforme a través de toda la plataforma. De esta manera, se facilita la administración de datos relacionados con estudiantes, personal, contenidos y estructura académica, manteniendo la coherencia entre módulos y permitiendo trabajar con los mismos conceptos en los diferentes componentes del sistema.',
            contact: {
                name: 'Dante Salamanca Galvis'
            },
        },
        servers: [
            {
                url: '/',
                description: 'Codespaces'
            },
            {
                url: 'https://localhost:44333',
                description: 'Servidor local'
            },
        ],
    },
    apis: [path.join(__dirname, '../routes/*.js')],
};

const specs = swaggerJsdoc(options);

module.exports = { specs };