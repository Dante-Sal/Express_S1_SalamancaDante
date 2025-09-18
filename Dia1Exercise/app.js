require('dotenv').config();
const express = require('express');
const passport = require('passport');
const swaggerUI = require('swagger-ui-express');
const { specs } = require('./swagger/swagger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(passport.initialize());
app.use('/docs', swaggerUI.serve, swaggerUI.setup(specs));
app.use('/', require('./routes'));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bienvenido al Sistema Campuslands! (http://localhost:${PORT})`);
});