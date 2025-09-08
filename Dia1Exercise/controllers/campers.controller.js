const { withDb } = require('../lib/withDb');
const { isPlainObject } = require('../lib/isPlainObject');
const { onlyAllowedKeys } = require('../lib/onlyAllowedKeys');

const list = async (req, res) => {
    try {
        const campers = await withDb(db => {
            return db.collection(`campers`).find().toArray();
        });

        return res.status(200).json(campers);
    } catch (err) {
        return res.status(500).send({ error: `error de base de datos` });
    };
};

const count = async (req, res) => {
    try {
        const total = await withDb(db => {
            return db.collection(`campers`).countDocuments();
        });

        return res.status(200).json({ total });
    } catch (err) {
        return res.status(500).send({ error: `error de base de datos` });
    };
};

const getByParamsId = async (req, res) => {
    const _id = Number(req.params.id);
    let camper = undefined;

    if (!Number.isFinite(_id) || !Number.isInteger(_id) || _id < 1) {
        return res.status(400).json({ error: `request inválida (ID no numérico positivo)` });
    };

    camper = await withDb(db => {
        return db.collection(`campers`).findOne({ _id });
    });

    if (!camper) {
        return res.status(404).json({ error: `0 campers coincidentes con el ID solicitado` });
    };

    return res.status(200).json(camper);
};

const getByBodyId = async (req, res) => {
    const rawId = req.body._id;
    let camper = undefined;

    if (rawId == null) {
        return res.status(400).json({ error: `request inválida (falta '_id' en el body)` });
    };

    const _id = Number(rawId);

    if (!Number.isFinite(_id) || !Number.isInteger(_id) || _id < 1) {
        return res.status(400).json({ error: `request inválida ('_id' no numérico positivo)` });
    };

    camper = await withDb(db => {
        return db.collection(`campers`).findOne({ _id });
    });

    if (!camper) {
        return res.status(404).json({ error: `0 campers coincidentes con el '_id' solicitado` });
    };

    return res.status(200).json(camper);
};

const startRegistration = async (req, res) => {
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

    const [lastIdDoc] = await withDb(db => {
        return db.collection(`campers`).find({}, { projection: { _id: 1 } }).sort({ _id: -1 }).limit(1).toArray();
    });

    let lastId = 0;

    if (lastIdDoc && lastIdDoc._id) {
        lastId = lastIdDoc._id;
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
            return res.status(400).json({ error: `request inválida (jornada inválida; válidas: 1, 2, 3, 4)` });
        } else if (!Number.isInteger(jornada)) {
            return res.status(400).json({ error: `request inválida ('jornada' de tipo no entero)` });
        };

        if (isPlainObject(acudiente)) {
            const cleanAttendant = Object.fromEntries(
                Object.entries(acudiente).filter(([key, val]) => val != null)
            );

            const attendantKeys = Object.keys(cleanAttendant);

            if (attendantKeys.length === 3 && attendantExpectedKeys.every(k => attendantKeys.includes(k))) {
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
                    _id: lastId + 1,
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

                const insertOneResult = await withDb(db => {
                    return db.collection(`campers`).insertOne(newCamper);
                });

                return res.status(201).location(`/campers/${insertOneResult.insertedId}`).json(newCamper);
            } else if (attendantKeys.length < 3 && onlyAllowedKeys(cleanAttendant, attendantExpectedKeys)) {
                if (cleanAttendant.nombres != null) {
                    if (typeof cleanAttendant.nombres === `string` && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(cleanAttendant.nombres.trim())) {
                        return res.status(400).json({ error: `request inválida (número de palabras superior a 2 en 'acudiente.nombres')` });
                    } else if (typeof cleanAttendant.nombres !== `string`) {
                        return res.status(400).json({ error: `request inválida ('acudiente.nombres' de tipo no string)` });
                    };
                };

                if (cleanAttendant.apellidos != null) {
                    if (typeof cleanAttendant.apellidos === `string` && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(cleanAttendant.apellidos.trim())) {
                        return res.status(400).json({ error: `request inválida (número de palabras superior a 2 en 'acudiente.apellidos')` });
                    } else if (typeof cleanAttendant.apellidos !== `string`) {
                        return res.status(400).json({ error: `request inválida ('acudiente.apellidos' de tipo no string)` });
                    };
                };

                if (cleanAttendant.telefono != null) {
                    if (typeof cleanAttendant.telefono === `string` && !/^3[0-9]{9}$/.test(cleanAttendant.telefono)) {
                        return res.status(400).json({ error: `request inválida (formato inválido en 'acudiente.telefono')` });
                    } else if (typeof cleanAttendant.telefono !== `string`) {
                        return res.status(400).json({ error: `request inválida ('acudiente.telefono' de tipo no string)` });
                    };
                };

                const newCamper = {
                    _id: lastId + 1,
                    estado: `En proceso de ingreso`,
                    riesgo: `Bajo`,
                    nombres: nombres,
                    apellidos: apellidos,
                    direccion: direccion,
                    telefono: telefono,
                    acudiente: {},
                    jornada: jornada
                };

                if (acudiente.nombres != null) {
                    newCamper.acudiente.nombres = acudiente.nombres;
                };

                if (acudiente.apellidos != null) {
                    newCamper.acudiente.apellidos = acudiente.apellidos;
                };

                if (acudiente.telefono != null) {
                    newCamper.acudiente.telefono = acudiente.telefono;
                };

                const insertOneResult = await withDb(db => {
                    return db.collection(`campers`).insertOne(newCamper);
                });

                return res.status(201).location(`/campers/${insertOneResult.insertedId}`).json(newCamper);
            } else {
                return res.status(400).json({ error: `request inválida (claves no permitidas en 'acudiente')` });
            };
        } else if (acudiente == null) {
            const newCamper = {
                _id: lastId + 1,
                estado: `En proceso de ingreso`,
                riesgo: `Bajo`,
                nombres: nombres,
                apellidos: apellidos,
                direccion: direccion,
                telefono: telefono,
                acudiente: {},
                jornada: jornada
            };

            const insertOneResult = await withDb(db => {
                return db.collection(`campers`).insertOne(newCamper);
            });

            return res.status(201).location(`/campers/${insertOneResult.insertedId}`).json(newCamper);
        } else {
            return res.status(400).json({ error: `request inválida ('acudiente' de tipo no plain object)` });
        };
    } else if (bodyKeys.length < 6 && onlyAllowedKeys(cleanBody, bodyExpectedKeys)) {
        if (nombres != null) {
            if (typeof nombres === `string` && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(nombres.trim())) {
                return res.status(400).json({ error: `request inválida (número de palabras superior a 2 en 'nombres')` });
            } else if (typeof nombres !== `string`) {
                return res.status(400).json({ error: `request inválida ('nombres' de tipo no string)` });
            };
        };

        if (apellidos != null) {
            if (typeof apellidos === `string` && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(apellidos.trim())) {
                return res.status(400).json({ error: `request inválida (número de palabras superior a 2 en 'apellidos')` });
            } else if (typeof apellidos !== `string`) {
                return res.status(400).json({ error: `request inválida ('apellidos' de tipo no string)` });
            };
        };

        if (direccion != null) {
            if (typeof direccion === `string` && direccion.trim() === ``) {
                return res.status(400).json({ error: `request inválida ('direccion' vacía)` });
            } else if (typeof direccion !== `string`) {
                return res.status(400).json({ error: `request inválida ('direccion' de tipo no string)` });
            };
        };

        if (telefono != null) {
            if (typeof telefono === `string` && !/^3[0-9]{9}$/.test(telefono)) {
                return res.status(400).json({ error: `request inválida (formato inválido en 'telefono')` });
            } else if (typeof telefono !== `string`) {
                return res.status(400).json({ error: `request inválida ('telefono' de tipo no string)` });
            };
        };

        if (jornada != null) {
            if (Number.isInteger(jornada) && (jornada < 1 || jornada > 4)) {
                return res.status(400).json({ error: `request inválida (jornada inválida [válidas: 1, 2, 3, 4])` });
            } else if (!Number.isInteger(jornada)) {
                return res.status(400).json({ error: `request inválida ('jornada' de tipo no entero)` });
            };
        };

        if (isPlainObject(acudiente)) {
            const cleanAttendant = Object.fromEntries(
                Object.entries(acudiente).filter(([key, val]) => val != null)
            );

            const attendantKeys = Object.keys(cleanAttendant);

            if (attendantKeys.length === 3 && attendantExpectedKeys.every(k => attendantKeys.includes(k))) {
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
                    _id: lastId + 1,
                    estado: `En proceso de ingreso`,
                    riesgo: `Bajo`
                };

                if (nombres != null) {
                    newCamper.nombres = nombres;
                };

                if (apellidos != null) {
                    newCamper.apellidos = apellidos;
                };

                if (direccion != null) {
                    newCamper.direccion = direccion;
                };

                if (telefono != null) {
                    newCamper.telefono = telefono;
                };

                newCamper.acudiente = {
                    nombres: acudiente.nombres,
                    apellidos: acudiente.apellidos,
                    telefono: acudiente.telefono
                };

                if (jornada != null) {
                    newCamper.jornada = jornada;
                };

                const insertOneResult = await withDb(db => {
                    return db.collection(`campers`).insertOne(newCamper);
                });

                return res.status(201).location(`/campers/${insertOneResult.insertedId}`).json(newCamper);
            } else if (attendantKeys.length < 3 && onlyAllowedKeys(cleanAttendant, attendantExpectedKeys)) {
                if (cleanAttendant.nombres != null) {
                    if (typeof cleanAttendant.nombres === `string` && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(cleanAttendant.nombres.trim())) {
                        return res.status(400).json({ error: `request inválida (número de palabras superior a 2 en 'acudiente.nombres')` });
                    } else if (typeof cleanAttendant.nombres !== `string`) {
                        return res.status(400).json({ error: `request inválida ('acudiente.nombres' de tipo no string)` });
                    };
                };

                if (cleanAttendant.apellidos != null) {
                    if (typeof cleanAttendant.apellidos === `string` && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(cleanAttendant.apellidos.trim())) {
                        return res.status(400).json({ error: `request inválida (número de palabras superior a 2 en 'acudiente.apellidos')` });
                    } else if (typeof cleanAttendant.apellidos !== `string`) {
                        return res.status(400).json({ error: `request inválida ('acudiente.apellidos' de tipo no string)` });
                    };
                };

                if (cleanAttendant.telefono != null) {
                    if (typeof cleanAttendant.telefono === `string` && !/^3[0-9]{9}$/.test(cleanAttendant.telefono)) {
                        return res.status(400).json({ error: `request inválida (formato inválido en 'acudiente.telefono')` });
                    } else if (typeof cleanAttendant.telefono !== `string`) {
                        return res.status(400).json({ error: `request inválida ('acudiente.telefono' de tipo no string)` });
                    };
                };

                const newCamper = {
                    _id: lastId + 1,
                    estado: `En proceso de ingreso`,
                    riesgo: `Bajo`
                };

                if (nombres != null) {
                    newCamper.nombres = nombres;
                };

                if (apellidos != null) {
                    newCamper.apellidos = apellidos;
                };

                if (direccion != null) {
                    newCamper.direccion = direccion;
                };

                if (telefono != null) {
                    newCamper.telefono = telefono;
                };

                newCamper.acudiente = {};

                if (acudiente.nombres != null) {
                    newCamper.acudiente.nombres = acudiente.nombres;
                };

                if (acudiente.apellidos != null) {
                    newCamper.acudiente.apellidos = acudiente.apellidos;
                };

                if (acudiente.telefono != null) {
                    newCamper.acudiente.telefono = acudiente.telefono;
                };

                if (jornada != null) {
                    newCamper.jornada = jornada;
                };

                const insertOneResult = await withDb(db => {
                    return db.collection(`campers`).insertOne(newCamper);
                });

                return res.status(201).location(`/campers/${insertOneResult.insertedId}`).json(newCamper);
            } else {
                return res.status(400).json({ error: `request inválida (claves no permitidas en 'acudiente')` });
            };
        } else if (acudiente == null) {
            const newCamper = {
                _id: lastId + 1,
                estado: `En proceso de ingreso`,
                riesgo: `Bajo`
            };

            if (nombres != null) {
                newCamper.nombres = nombres;
            };

            if (apellidos != null) {
                newCamper.apellidos = apellidos;
            };

            if (direccion != null) {
                newCamper.direccion = direccion;
            };

            if (telefono != null) {
                newCamper.telefono = telefono;
            };

            newCamper.acudiente = {};

            if (jornada != null) {
                newCamper.jornada = jornada;
            };

            const insertOneResult = await withDb(db => {
                return db.collection(`campers`).insertOne(newCamper);
            });

            return res.status(201).location(`/campers/${insertOneResult.insertedId}`).json(newCamper);
        } else {
            return res.status(400).json({ error: `request inválida ('acudiente' de tipo no plain object)` });
        };
    } else {
        return res.status(400).json({ error: `request inválida (claves no permitidas en el body)` });
    };
};

const continueRegistration = async (req, res) => {
    const { _id, ...changes } = req.body;

    const bodyExpectedKeys = [`nombres`, `apellidos`, `direccion`, `telefono`, `acudiente`, `jornada`];
    const attendantExpectedKeys = [`nombres`, `apellidos`, `telefono`];

    let incompleteCamper = undefined;

    if (_id == null) {
        return res.status(400).json({ error: `request inválida (falta '_id' en el body)` });
    };

    const numberId = Number(_id);

    if (!Number.isFinite(numberId) || !Number.isInteger(numberId) || numberId < 1) {
        return res.status(400).json({ error: `request inválida ('_id' no numérico positivo)` });
    };

    incompleteCamper = await withDb(db => {
        return db.collection(`campers`).findOne({ _id: numberId, estado: `En proceso de ingreso` });
    });

    if (!incompleteCamper) {
        return res.status(404).json({ error: `0 campers 'En proceso de ingreso' coincidentes con el '_id' solicitado` });
    };

    const cleanBody = Object.fromEntries(
        Object.entries(changes).filter(([key, val]) => val != null)
    );

    const bodyKeys = Object.keys(cleanBody);

    if (bodyKeys.length < 1) {
        return res.status(400).json({ error: `request inválida (datos insuficientes en el body)` });
    };

    const incompleteCamperKeys = Object.keys(incompleteCamper);
    const incompleteCamperAttendantKeys = Object.keys(incompleteCamper.acudiente);
    const missingExpectedBodyKeys = bodyExpectedKeys.filter(k => !incompleteCamperKeys.includes(k));
    const missingExpectedAttendantKeys = attendantExpectedKeys.filter(k => !incompleteCamperAttendantKeys.includes(k));

    if (!Object.keys(incompleteCamper.acudiente).length || missingExpectedAttendantKeys.length) {
        missingExpectedBodyKeys.push(`acudiente`);
    };

    if (onlyAllowedKeys(cleanBody, missingExpectedBodyKeys)) {
        if (cleanBody.nombres != null) {
            if (typeof cleanBody.nombres === `string` && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(cleanBody.nombres.trim())) {
                return res.status(400).json({ error: `request inválida (número de palabras superior a 2 en 'nombres')` });
            } else if (typeof cleanBody.nombres !== `string`) {
                return res.status(400).json({ error: `request inválida ('nombres' de tipo no string)` });
            };
        };

        if (cleanBody.apellidos != null) {
            if (typeof cleanBody.apellidos === `string` && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(cleanBody.apellidos.trim())) {
                return res.status(400).json({ error: `request inválida (número de palabras superior a 2 en 'apellidos')` });
            } else if (typeof cleanBody.apellidos !== `string`) {
                return res.status(400).json({ error: `request inválida ('apellidos' de tipo no string)` });
            };
        };

        if (cleanBody.direccion != null) {
            if (typeof cleanBody.direccion === `string` && cleanBody.direccion.trim() === ``) {
                return res.status(400).json({ error: `request inválida ('direccion' vacía)` });
            } else if (typeof cleanBody.direccion !== `string`) {
                return res.status(400).json({ error: `request inválida ('direccion' de tipo no string)` });
            };
        };

        if (cleanBody.telefono != null) {
            if (typeof cleanBody.telefono === `string` && !/^3[0-9]{9}$/.test(cleanBody.telefono)) {
                return res.status(400).json({ error: `request inválida (formato inválido en 'telefono')` });
            } else if (typeof cleanBody.telefono !== `string`) {
                return res.status(400).json({ error: `request inválida ('telefono' de tipo no string)` });
            };
        };

        if (cleanBody.jornada != null) {
            if (Number.isInteger(cleanBody.jornada) && (cleanBody.jornada < 1 || cleanBody.jornada > 4)) {
                return res.status(400).json({ error: `request inválida (jornada inválida [válidas: 1, 2, 3, 4])` });
            } else if (!Number.isInteger(cleanBody.jornada)) {
                return res.status(400).json({ error: `request inválida ('jornada' de tipo no entero)` });
            };
        };

        const allBodyKeys = bodyKeys.length === missingExpectedBodyKeys.length && missingExpectedBodyKeys.every(k => bodyKeys.includes(k));

        if (cleanBody.acudiente == null) {
            if (allBodyKeys && Object.keys(incompleteCamper.acudiente).length === 3) {
                incompleteCamper.estado = `Inscrito`;
            };

            if (cleanBody.nombres != null) {
                incompleteCamper.nombres = cleanBody.nombres;
            };

            if (cleanBody.apellidos != null) {
                incompleteCamper.apellidos = cleanBody.apellidos;
            };

            if (cleanBody.direccion != null) {
                incompleteCamper.direccion = cleanBody.direccion;
            };

            if (cleanBody.telefono != null) {
                incompleteCamper.telefono = cleanBody.telefono;
            };

            if (cleanBody.jornada != null) {
                incompleteCamper.jornada = cleanBody.jornada;
            };

            const updatedCamper = incompleteCamper;

            await withDb(db => {
                return db.collection(`campers`).replaceOne({ _id: numberId }, updatedCamper, { upsert: false });
            });

            return res.status(200).location(`/campers/${updatedCamper._id}`).json(updatedCamper);
        } else if (isPlainObject(cleanBody.acudiente)) {
            const cleanAttendant = Object.fromEntries(
                Object.entries(cleanBody.acudiente).filter(([key, val]) => val != null)
            );

            const attendantKeys = Object.keys(cleanAttendant);

            if (onlyAllowedKeys(cleanAttendant, missingExpectedAttendantKeys)) {
                if (cleanAttendant.nombres != null) {
                    if (typeof cleanAttendant.nombres === `string` && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(cleanAttendant.nombres.trim())) {
                        return res.status(400).json({ error: `request inválida (número de palabras superior a 2 en 'acudiente.nombres')` });
                    } else if (typeof cleanAttendant.nombres !== `string`) {
                        return res.status(400).json({ error: `request inválida ('acudiente.nombres' de tipo no string)` });
                    };
                };

                if (cleanAttendant.apellidos != null) {
                    if (typeof cleanAttendant.apellidos === `string` && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(cleanAttendant.apellidos.trim())) {
                        return res.status(400).json({ error: `request inválida (número de palabras superior a 2 en 'acudiente.apellidos')` });
                    } else if (typeof cleanAttendant.apellidos !== `string`) {
                        return res.status(400).json({ error: `request inválida ('acudiente.apellidos' de tipo no string)` });
                    };
                };

                if (cleanAttendant.telefono != null) {
                    if (typeof cleanAttendant.telefono === `string` && !/^3[0-9]{9}$/.test(cleanAttendant.telefono)) {
                        return res.status(400).json({ error: `request inválida (formato inválido en 'acudiente.telefono')` });
                    } else if (typeof cleanAttendant.telefono !== `string`) {
                        return res.status(400).json({ error: `request inválida ('acudiente.telefono' de tipo no string)` });
                    };
                };

                const allAttendantKeys = attendantKeys.length === missingExpectedAttendantKeys.length && missingExpectedAttendantKeys.every(k => attendantKeys.includes(k));

                if (allBodyKeys && allAttendantKeys) {
                    incompleteCamper.estado = `Inscrito`;
                };

                if (cleanBody.nombres != null) {
                    incompleteCamper.nombres = cleanBody.nombres;
                };

                if (cleanBody.apellidos != null) {
                    incompleteCamper.apellidos = cleanBody.apellidos;
                };

                if (cleanBody.direccion != null) {
                    incompleteCamper.direccion = cleanBody.direccion;
                };

                if (cleanBody.telefono != null) {
                    incompleteCamper.telefono = cleanBody.telefono;
                };

                if (missingExpectedAttendantKeys.length > 0 && onlyAllowedKeys(cleanAttendant, missingExpectedAttendantKeys)) {
                    const updatedAttendant = {};

                    let attendantNames = undefined;
                    let attendantSurnames = undefined;
                    let attendantTelephoneNumber = undefined;

                    if (incompleteCamper.acudiente.nombres != null) {
                        attendantNames = incompleteCamper.acudiente.nombres;
                    } else if (cleanAttendant.nombres != null) {
                        attendantNames = cleanAttendant.nombres;
                    };

                    if (attendantNames) {
                        updatedAttendant.nombres = attendantNames;
                    };

                    if (incompleteCamper.acudiente.apellidos != null) {
                        attendantSurnames = incompleteCamper.acudiente.apellidos;
                    } else if (cleanAttendant.apellidos != null) {
                        attendantSurnames = cleanAttendant.apellidos;
                    };

                    if (attendantSurnames) {
                        updatedAttendant.apellidos = attendantSurnames;
                    };

                    if (incompleteCamper.acudiente.telefono != null) {
                        attendantTelephoneNumber = incompleteCamper.acudiente.telefono;
                    } else if (cleanAttendant.telefono != null) {
                        attendantTelephoneNumber = cleanAttendant.telefono;
                    };

                    if (attendantTelephoneNumber) {
                        updatedAttendant.telefono = attendantTelephoneNumber;
                    };

                    incompleteCamper.acudiente = updatedAttendant;
                };

                if (cleanBody.jornada != null) {
                    incompleteCamper.jornada = cleanBody.jornada;
                };

                const updatedCamper = incompleteCamper;

                await withDb(db => {
                    return db.collection(`campers`).replaceOne({ _id: numberId }, updatedCamper, { upsert: false });
                });

                return res.status(200).location(`/campers/${updatedCamper._id}`).json(updatedCamper);
            } else {
                return res.status(400).json({ error: `request inválida (claves no permitidas en 'acudiente')` });
            };
        } else {
            return res.status(400).json({ error: `request inválida ('acudiente' de tipo no plain object)` });
        };
    } else {
        return res.status(400).json({ error: `request inválida (claves no permitidas en el body)` });
    };
};

module.exports = { list, count, getByParamsId, getByBodyId, startRegistration, continueRegistration };