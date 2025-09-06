require('dotenv').config();

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

const campers = [];
let campersNextId = 0;

function isPlainObject(x) {
    if (Object.prototype.toString.call(x) !== `[object Object]`) return false;
    const proto = Object.getPrototypeOf(x);
    return proto === Object.prototype;
};

app.use(express.json());

app.get(`/campers`, (req, res) => {
    return res.status(200).json(campers);
});

app.get('/mensajePersonalizado/:nombre', (req, res) => {
    const nombre = req.params.nombre;
    res.send(`¡Hola ${nombre}!`);
});

app.get(`/campers/:id`, (req, res) => {
    const id = Number(req.params.id);
    let camper = undefined;

    if (!Number.isFinite(id) || !Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: `request inválida ('id' no numérico positivo)` });
    };

    for (let i = 0; i < campers.length; i++) {
        const c = campers[i];

        if (c.id === id) {
            camper = c;
            break;
        };
    };

    if (!camper) {
        return res.status(404).json({ error: `0 campers coincidentes con el 'id' solicitado` });
    };

    return res.status(200).json(camper);
});

app.post(`/camper`, (req, res) => {
    const rawId = req.body.id;
    let camper = undefined;

    if (rawId == null) {
        return res.status(400).json({ error: `request inválida (falta 'id' en el body)` });
    };

    const id = Number(rawId);

    if (!Number.isFinite(id) || !Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: `request inválida ('id' no numérico positivo)` });
    };

    for (let i = 0; i < campers.length; i++) {
        const c = campers[i];

        if (c.id === id) {
            camper = c;
            break;
        };
    };

    if (!camper) {
        return res.status(404).json({ error: `0 campers coincidentes con el 'id' solicitado` });
    };

    return res.status(200).json(camper);
});

app.post(`/campers`, (req, res) => {
    const bodyExpectedKeys = [`nombres`, `apellidos`, `direccion`, `telefono`, `acudiente`, `jornada`];
    const attendantExpectedKeys = [`nombres`, `apellidos`, `telefono`];

    const cleanBody = Object.fromEntries(
        Object.entries(req.body).filter(([key, val]) => val != null)
    );

    const { nombres, apellidos, direccion, telefono, acudiente, jornada } = cleanBody;
    const bodyKeys = Object.keys(cleanBody);

    if (bodyKeys.length < 1) {
        return res.status(400).json({ error: `request inválida (datos insuficientes en el body)` });
    };

    if (bodyKeys.length === 6 && bodyExpectedKeys.every(k => bodyKeys.includes(k))) {
        if (typeof nombres === `string` && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(nombres.trim())) {
            return res.status(400).json({ error: `request inválida (número de palabras superior a 2 en 'nombres')` });
        } else if (typeof nombres !== `string`) {
            return res.status(400).json({ error: `request inválida ('nombres' de tipo no string)` });
        };

        if (typeof apellidos === `string` && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(apellidos.trim())) {
            return res.status(400).json({ error: `request inválida (número de palabras superior a 2 en 'apellidos')` });
        } else if (typeof apellidos !== `string`) {
            return res.status(400).json({ error: `request inválida ('apellidos' de tipo no string)` });
        };

        if (typeof direccion === `string` && direccion.trim() === ``) {
            return res.status(400).json({ error: `request inválida ('direccion' vacía)` });
        } else if (typeof direccion !== `string`) {
            return res.status(400).json({ error: `request inválida ('direccion' de tipo no string)` });
        };

        if (typeof telefono === `string` && !/^3[0-9]{9}$/.test(telefono)) {
            return res.status(400).json({ error: `request inválida (formato inválido en 'telefono')` });
        } else if (typeof telefono !== `string`) {
            return res.status(400).json({ error: `request inválida ('telefono' de tipo no string)` });
        };

        if (Number.isInteger(jornada) && (jornada < 1 || jornada > 4)) {
            return res.status(400).json({ error: `request inválida (jornada inválida [válidas: 1, 2, 3, 4])` });
        } else if (!Number.isInteger(jornada)) {
            return res.status(400).json({ error: `request inválida ('jornada' de tipo no entero)` });
        };

        if (isPlainObject(acudiente)) {
            const cleanAttendant = Object.fromEntries(
                Object.entries(acudiente).filter(([key, val]) => val != null)
            );

            const attendantKeys = Object.keys(cleanAttendant);

            if (attendantExpectedKeys.every(k => attendantKeys.includes(k))) {
                if (typeof cleanAttendant.nombres === `string` && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(cleanAttendant.nombres.trim())) {
                    return res.status(400).json({ error: `request inválida (número de palabras superior a 2 en 'acudiente.nombres')` });
                } else if (typeof cleanAttendant.nombres !== `string`) {
                    return res.status(400).json({ error: `request inválida ('acudiente.nombres' de tipo no string)` });
                };

                if (typeof cleanAttendant.apellidos === `string` && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(cleanAttendant.apellidos.trim())) {
                    return res.status(400).json({ error: `request inválida (número de palabras superior a 2 en 'acudiente.apellidos')` });
                } else if (typeof cleanAttendant.apellidos !== `string`) {
                    return res.status(400).json({ error: `request inválida ('acudiente.apellidos' de tipo no string)` });
                };

                if (typeof cleanAttendant.telefono === `string` && !/^3[0-9]{9}$/.test(cleanAttendant.telefono)) {
                    return res.status(400).json({ error: `request inválida (formato inválido en 'acudiente.telefono')` });
                } else if (typeof cleanAttendant.telefono !== `string`) {
                    return res.status(400).json({ error: `request inválida ('acudiente.telefono' de tipo no string)` });
                };

                const newCamper = {
                    id: campersNextId++,
                    estado: `Inscrito`,
                    riesgo: `Bajo`,
                    nombres: nombres,
                    apellidos: apellidos,
                    direccion: direccion,
                    telefono: telefono,
                    acudiente: {
                        nombres: acudiente.nombres,
                        apellidos: acudiente.apellidos,
                        telefono: acudiente.telefono
                    },
                    jornada: jornada
                };

                campers.push(newCamper);

                return res.status(201).location(`/campers/${newCamper.id}`).json(newCamper);
            };
        } else if (!isPlainObject(acudiente)) {
            return res.status(400).json({ error: `request inválida ('acudiente' de tipo no plain object)` });
        };
    };
});

app.listen(PORT, () => {
    console.log(`Bienvenido al Sistema Campuslands!`);
});