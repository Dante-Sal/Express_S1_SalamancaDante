require('dotenv').config();
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

const campers = [];
let campersNextId = 1;

app.use(express.json());
app.use('/', require('./routes'))

app.listen(PORT, () => {
    console.log(`Bienvenido al Sistema Campuslands!`);
});