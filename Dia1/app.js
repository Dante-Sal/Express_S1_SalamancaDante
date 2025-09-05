const express = require('express');
const app = express();

require('dotenv').config();

const PORT = process.env.PORT;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Holisssss!! Bienvenidos a expressssss!');
});

app.get('/mensaje1', (req, res) => {
    res.send('Este es otro endpoint');
});

app.post('/mensaje1', (req, res) => {
    res.send('Un post falso');
});

app.get('/mensaje2', (req, res) => {
    let jsonsito = {
        "mensaje": "Holiii"
    };

    res.json(jsonsito);
});

app.get('/mensajePersonalizado/:nombre', (req, res) => {
    const nombre = req.params.nombre;
    res.send(`¡Hola ${nombre}!`);
});

app.post('/mensajeJSON', (req, res) => {
    const menJson = req.body;
    res.send(`¡Hola ${menJson["nombre"]}, con ${menJson["edad"]} año/s!`);
});

app.listen(PORT, () => {
    console.log('Servidor iniciado!');
});