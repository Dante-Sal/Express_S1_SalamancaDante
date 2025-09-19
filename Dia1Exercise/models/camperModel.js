require('dotenv').config();
const bcrypt = require('bcrypt');
const { MongoClient, ObjectId } = require('mongodb');

class CamperModel {
    constructor() {
        this.client = new MongoClient(process.env.URI);
        this.database = process.env.DATABASE;
        this.collection = `campers`;

        this.BODY_EXPECTED_KEYS = [`nombres`, `apellidos`, `direccion`, `email`, `telefono`, `acudiente`, `jornada`, `contrasena`];
        this.ATTENDANT_EXPECTED_KEYS = [`nombres`, `apellidos`, `telefono`];

        this.PATTERNS = {
            nombres: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/,
            apellidos: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/,
            direccion: /^\S[\s\S]*\S$/,
            email: /^(?!.*\.\.)([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9._+-]*[a-zA-Z0-9])@([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9])\.[a-zA-Z]{2,}$/,
            telefono: /^3[0-9]{9}$/,
            contrasena: /^\S{8,}$/
        };

        this.PATT_ERR_MESSAGES = {
            nombres: `número de palabras superior a 2 en 'nombres'/campo 'nombres' vacío`,
            apellidos: `número de palabras diferente de 2 en 'apellidos'`,
            direccion: `'direccion' vacía`,
            email: `formato inválido en 'email'`,
            telefono: `formato inválido en 'telefono'`,
            contrasena: `número de caracteres inferior a 8 en 'contrasena'`
        };
    };

    async connect() {
        if (!this.client.topology?.isConnected()) await this.client.connect();
        return this.client.db(this.database).collection(this.collection);
    };

    clean(object) {
        return Object.fromEntries(Object.entries(object ?? {}).filter(([key, value]) => value != null));
    };

    isPlainObject(x) {
        if (Object.prototype.toString.call(x) !== `[object Object]`) return false;
        const proto = Object.getPrototypeOf(x);
        return proto === Object.prototype;
    };

    onlyAllowedKeys(object, allowedKeys) {
        if (!this.isPlainObject(object)) return false;
        const allowed = new Set(allowedKeys);
        return Object.keys(object).every(k => allowed.has(k));
    };

    validateObjectId(_id) {
        return ObjectId.isValid(_id);
    };

    validateStrings(value, pattern, errMsgs, errors) {
        if (value == null) return errors;
        if (typeof value !== `string`) { errors.push(errMsgs[0]); return errors };
        if (!pattern.test(value.trim())) errors.push(errMsgs[1]);
        return errors;
    };

    validateAllStringFields(fields, object, errors) {
        let keys;

        if (Array.isArray(fields)) keys = fields;
        else keys = Object.keys(fields);

        for (const key of keys) {
            const value = object[key];
            const pattern = this.PATTERNS[key];
            const errMsgs = [`solicitud inválida ('${key}' de tipo no string)`, `solicitud inválida (${this.PATT_ERR_MESSAGES[key]})`];

            errors = this.validateStrings(value, pattern, errMsgs, errors);
        };

        return errors;
    };

    validateRegistrationStart(payload) {
        let errors = [];
        const body = this.clean(payload);
        const bodyKeys = Object.keys(body);
        const isRegistrationCompleted = bodyKeys.length === 8 && this.BODY_EXPECTED_KEYS.every(key => bodyKeys.includes(key));

        if (bodyKeys.length < 1) errors.push(`solicitud inválida (datos insuficientes en el cuerpo)`);
        if (!bodyKeys.includes(`email`)) errors.push(`solicitud inválida (cuerpo sin 'email' incluido)`);
        if (!bodyKeys.includes(`contrasena`)) errors.push(`solicitud inválida (cuerpo sin 'contrasena' incluida)`);

        if (isRegistrationCompleted || (bodyKeys.length < 8 && this.onlyAllowedKeys(body, this.BODY_EXPECTED_KEYS))) {
            errors = this.validateAllStringFields(this.PATTERNS, body, errors);

            if (this.isPlainObject(body.acudiente) || body.acudiente == null) {
                if (body.acudiente) {
                    body.acudiente = this.clean(body.acudiente);
                    const attendantKeys = Object.keys(body.acudiente);

                    if ((attendantKeys.length === 3 && this.ATTENDANT_EXPECTED_KEYS.every(key => attendantKeys.includes(key))) ||
                        (attendantKeys.length < 3 && this.onlyAllowedKeys(body.acudiente, this.ATTENDANT_EXPECTED_KEYS))) {
                        errors = this.validateAllStringFields(this.ATTENDANT_EXPECTED_KEYS, body.acudiente, errors);
                    } else {
                        errors.push(`solicitud inválida (claves no permitidas en 'acudiente')`);
                    };
                };
            } else {
                errors.push(`solicitud inválida (formato inválido en 'acudiente')`);
            };

            if (body.jornada != null) {
                if (Number.isInteger(body.jornada) && (body.jornada < 1 || body.jornada > 4)) {
                    errors.push(`solicitud inválida (jornadas válidas: 1, 2, 3, 4)`);
                } else if (!Number.isInteger(body.jornada)) {
                    errors.push(`solicitud inválida ('jornada' de tipo no entero)`);
                };
            };
        } else {
            errors.push(`solicitud inválida (claves no permitidas en el cuerpo)`);
        };

        return { ok: errors.length === 0, errors, body, isRegistrationCompleted };
    };

    async validateRegistrationContinuation(_id, payload) {
        let errors = [];

        if (!_id) { errors.push(`solicitud inválida (falta '_id' en los parámetros)`); return { ok: false, errors } };
        if (!this.validateObjectId(_id)) { errors.push(`solicitud inválida ('_id' de tipo no ObjectId)`); return { ok: false, errors } };

        const body = this.clean(payload);
        const bodyKeys = Object.keys(body);

        if (bodyKeys.length < 1) errors.push(`solicitud inválida (datos insuficientes en el cuerpo)`);

        let incompleteCamper = await this.findIncompleteById(_id);
        if (!incompleteCamper) return { ok: false, errors: 404 };

        const incompleteCamperKeys = Object.keys(incompleteCamper);
        const incompleteCamperAttendantKeys = Object.keys(incompleteCamper.acudiente || {});
        const missingExpectedBodyKeys = this.BODY_EXPECTED_KEYS.filter(k => !incompleteCamperKeys.includes(k));
        const missingExpectedAttendantKeys = this.ATTENDANT_EXPECTED_KEYS.filter(k => !incompleteCamperAttendantKeys.includes(k));

        if (incompleteCamperAttendantKeys.length === 0 || missingExpectedAttendantKeys.length) {
            if (!missingExpectedBodyKeys.includes(`acudiente`)) missingExpectedBodyKeys.push(`acudiente`);
        };

        const allBodyKeys = bodyKeys.length === missingExpectedBodyKeys.length && missingExpectedBodyKeys.every(k => bodyKeys.includes(k));
        let allAttendantKeys = false;

        if (this.onlyAllowedKeys(body, missingExpectedBodyKeys)) {
            errors = this.validateAllStringFields(this.PATTERNS, body, errors);

            if (!body.acudiente || this.isPlainObject(body.acudiente)) {
                if (body.acudiente) {
                    body.acudiente = this.clean(body.acudiente);
                    const attendantKeys = Object.keys(body.acudiente);

                    allAttendantKeys = attendantKeys.length === missingExpectedAttendantKeys.length && missingExpectedAttendantKeys.every(k => attendantKeys.includes(k));

                    if (this.onlyAllowedKeys(body.acudiente, missingExpectedAttendantKeys)) {
                        errors = this.validateAllStringFields(this.ATTENDANT_EXPECTED_KEYS, body.acudiente, errors);
                    } else {
                        errors.push(`solicitud inválida (claves no permitidas en 'acudiente')`);
                    };
                };
            } else {
                errors.push(`solicitud inválida (formato inválido en 'acudiente')`);
            };

            if (body.jornada != null) {
                if (Number.isInteger(body.jornada) && (body.jornada < 1 || body.jornada > 4)) {
                    errors.push(`solicitud inválida (jornadas válidas: 1, 2, 3, 4)`);
                } else if (!Number.isInteger(body.jornada)) {
                    errors.push(`solicitud inválida ('jornada' de tipo no entero)`);
                };
            };
        } else {
            errors.push(`solicitud inválida (claves no permitidas en el cuerpo)`);
        };

        return { ok: errors.length === 0, errors, body, incompleteCamper, missingExpectedBodyKeys, missingExpectedAttendantKeys, allBodyKeys, allAttendantKeys };
    };

    async hash(password) {
        return await bcrypt.hash(password, 10);
    };

    async compare(reqPassword, dbPassword) {
        return await bcrypt.compare(reqPassword, dbPassword);
    };

    async list() {
        const collection = await this.connect();
        return await collection.find({}, { projection: { contrasena: 0 } }).toArray();
    };

    async count() {
        const collection = await this.connect();
        return await collection.countDocuments();
    };

    async findById(_id) {
        const collection = await this.connect();
        return await collection.findOne({ _id: new ObjectId(_id) }, { projection: { contrasena: 0 } });
    };

    async findByEmail(email) {
        const collection = await this.connect();
        return await collection.findOne({ email });
    };

    async findIncompleteById(_id) {
        const collection = await this.connect();
        return await collection.findOne({ _id: new ObjectId(_id), estado: `En proceso de ingreso` });
    };

    async startRegistrationAndComplete(body) {
        const collection = await this.connect();

        return await collection.insertOne({
            estado: `Inscrito`,
            riesgo: `Bajo`,
            nombres: body.nombres,
            apellidos: body.apellidos,
            direccion: body.direccion,
            email: body.email,
            telefono: body.telefono,
            acudiente: {
                nombres: body.acudiente.nombres,
                apellidos: body.acudiente.apellidos,
                telefono: body.acudiente.telefono
            },
            jornada: body.jornada,
            contrasena: body.contrasena
        });
    };

    async startRegistrationAndStop(body) {
        const collection = await this.connect();

        const newCamper = {
            estado: `En proceso de ingreso`,
            riesgo: `Bajo`
        };

        if (body.nombres) newCamper.nombres = body.nombres;
        if (body.apellidos) newCamper.apellidos = body.apellidos;
        if (body.direccion) newCamper.direccion = body.direccion;
        newCamper.email = body.email;
        if (body.telefono) newCamper.telefono = body.telefono;
        if (body.acudiente) {
            newCamper.acudiente = {}

            if (body.acudiente.nombres) newCamper.acudiente.nombres = body.acudiente.nombres;
            if (body.acudiente.apellidos) newCamper.acudiente.apellidos = body.acudiente.apellidos;
            if (body.acudiente.telefono) newCamper.acudiente.telefono = body.acudiente.telefono;
        };

        if (body.jornada) newCamper.jornada = body.jornada;
        newCamper.contrasena = body.contrasena;

        return await collection.insertOne(newCamper);
    };

    async continueRegistrationWithoutAttendant(body, incompleteCamper, allBodyKeys) {
        const collection = await this.connect();

        if (allBodyKeys && Object.keys(incompleteCamper.acudiente || {}).length === 3) incompleteCamper.estado = `Inscrito`;
        if (body.nombres != null) incompleteCamper.nombres = body.nombres;
        if (body.apellidos != null) incompleteCamper.apellidos = body.apellidos;
        if (body.direccion != null) incompleteCamper.direccion = body.direccion;
        if (body.telefono != null) incompleteCamper.telefono = body.telefono;
        if (body.jornada != null) incompleteCamper.jornada = body.jornada;

        const completeCamper = incompleteCamper;
        const { contrasena, ...completePublicCamper } = updatedCamper;
        const response = await collection.replaceOne({
            _id: 
                incompleteCamper._id instanceof ObjectId ? 
                incompleteCamper._id :
                new ObjectId(incompleteCamper._id) },
            completeCamper
        );

        return [response, completePublicCamper];
    };

    async continueRegistrationWithAttendant(body, incompleteCamper, missingExpectedAttendantKeys, allBodyKeys, allAttendantKeys) {
        const collection = await this.connect();

        if (allBodyKeys && allAttendantKeys) incompleteCamper.estado = `Inscrito`;
        if (body.nombres != null) incompleteCamper.nombres = body.nombres;
        if (body.apellidos != null) incompleteCamper.apellidos = body.apellidos;
        if (body.direccion != null) incompleteCamper.direccion = body.direccion;
        if (body.telefono != null) incompleteCamper.telefono = body.telefono;

        if (missingExpectedAttendantKeys.length > 0 && this.onlyAllowedKeys(body.acudiente, missingExpectedAttendantKeys)) {
            const updatedAttendant = {};

            let attendantNames = undefined;
            let attendantSurnames = undefined;
            let attendantTelephoneNumber = undefined;

            if (incompleteCamper.acudiente.nombres != null) attendantNames = incompleteCamper.acudiente.nombres;
            else if (body.acudiente.nombres != null) attendantNames = body.acudiente.nombres;

            if (attendantNames) updatedAttendant.nombres = attendantNames;

            if (incompleteCamper.acudiente.apellidos != null) attendantSurnames = incompleteCamper.acudiente.apellidos;
            else if (body.acudiente.apellidos != null) attendantSurnames = body.acudiente.apellidos;

            if (attendantSurnames) updatedAttendant.apellidos = attendantSurnames;

            if (incompleteCamper.acudiente.telefono != null) attendantTelephoneNumber = incompleteCamper.acudiente.telefono;
            else if (body.acudiente.telefono != null) attendantTelephoneNumber = body.acudiente.telefono;

            if (attendantTelephoneNumber) updatedAttendant.telefono = attendantTelephoneNumber;

            incompleteCamper.acudiente = updatedAttendant;
        };

        if (body.jornada != null) incompleteCamper.jornada = body.jornada;

        const updatedCamper = incompleteCamper;
        const { contrasena, ...updatedPublicCamper } = updatedCamper;
        const response = await collection.replaceOne({ _id: new ObjectId(incompleteCamper._id) }, updatedCamper);

        return [response, updatedPublicCamper];
    };
};

module.exports = { CamperModel }