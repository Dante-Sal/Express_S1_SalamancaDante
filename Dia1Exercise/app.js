require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { specs } = require('./swagger/swagger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/', require('./routes'))

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bienvenido al Sistema Campuslands!`);
});