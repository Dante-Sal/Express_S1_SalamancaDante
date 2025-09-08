const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Campuslands System API',
            version: '1.0.0',
            description: '',
            contact: {
                name: 'Dante Salamanca Galvis'
            },
            servers: [
                {
                    url: 'http://localhost:3000',
                    description: 'Local server'
                },
                {
                    url: '/',
                    description: 'Codespaces'
                }
            ]
        },
    },
    apis: ['../routes/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = { specs };