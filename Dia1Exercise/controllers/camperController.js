require('dotenv').config();
const jwt = require('jsonwebtoken');
const { CamperModel } = require('../models/camperModel');

class CamperController {
    constructor() {
        this.camperModel = new CamperModel();
    };

    async list(req, res) {
        try {
            const campers = await this.camperModel.list();
            res.status(200).json({ msg: `éxito (campers extraídos de la base de datos)`, campers });
        } catch (err) {
            res.status(500).json({ error: err.message });
        };
    };

    async count(req, res) {
        try {
            const total = await this.camperModel.count();
            res.status(200).json({ msg: `éxito (campers contabilizados en la base de datos)`, total });
        } catch (err) {
            res.status(500).json({ error: err.message });
        };
    };

    async findById(req, res) {
        try {
            const id = req.params.id;
            if (!this.camperModel.validateObjectId(id)) return res.status(400).json({ error: `solicitud inválida ('_id' de tipo no ObjectId)` });

            const camper = await this.camperModel.findById(id);
            if (!camper) return res.status(404).json({ error: `no encontrado (camper no registrado en la base de datos)` });
            
            res.status(200).json({ msg: `éxito (camper extraído de la base de datos)`, camper });
        } catch (err) {
            res.status(500).json({ error: err.message });
        };
    };

    async register(req, res) {
        try {
            const payload = req.body;
            let { email, contrasena, ...data } = payload;
            const { ok, errors, body, isRegistrationCompleted } = this.camperModel.validateRegistrationStart(payload);
            
            const emailExists = await this.camperModel.findByEmail(email);
            const attendantExists = body.acudiente != null;
            
            let response;

            if (emailExists) return res.status(400).json({ error: `solicitud inválida ('email' ya registrado en la base de datos)` });
            if (!ok) return res.status(400).json({ error: errors[0] });

            const hashedPassword = await this.camperModel.hash(contrasena);
            const newCamper = { ...data, email, contrasena: hashedPassword };

            if (isRegistrationCompleted && attendantExists && Object.keys(body.acudiente).length === 3) {
                response = await this.camperModel.startRegistrationAndComplete(newCamper);
            } else {
                response = await this.camperModel.startRegistrationAndStop(newCamper);
            };

            res.status(201).json({ msg: `éxito (camper registrado en la base de datos)`, response, data: { ...data, email } });
        } catch (err) {
            res.status(500).json({ error: err.message });
        };
    };

    async login(req, res) {
        try {
            let { email, contrasena } = req.body;
            const camper = await this.camperModel.findByEmail(email);

            if (!camper) return res.status(404).json({ error: `no encontrado (camper no registrado en la base de datos)` });

            const passwordIsValid = await this.camperModel.compare(contrasena, camper.contrasena);

            if (!passwordIsValid) return res.status(401).json({ error: `acceso denegado ('contrasena' en el cuerpo no coincide con 'contrasena' en la base de datos)` });

            const token = jwt.sign(
                { id: camper._id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES }
            );

            res.status(202).json({ msg: `éxito (acceso permitido: incluir token en solicitudes privadas para autenticar)`, token, expiresIn: process.env.JWT_EXPIRES });
        } catch (err) {
            res.status(500).json({ error: err.message });
        };
    };

    async continue(req, res) {
        try {
            const id = req.params.id;
            const payload = req.body;
            const { ok, errors, body, incompleteCamper, missingExpectedBodyKeys, missingExpectedAttendantKeys, allBodyKeys, allAttendantKeys } = await this.camperModel.validateRegistrationContinuation(id, payload);
            const attendantExistsInPayload = body.acudiente != null;
            
            let response;

            if (errors === 404) return res.status(404).json({ error: `no encontrado (camper no registrado en la base de datos)` });
            if (!ok) return res.status(400).json({ error: errors[0] });

            if (this.camperModel.onlyAllowedKeys(body, missingExpectedBodyKeys) && !attendantExistsInPayload) {
                response = await this.camperModel.continueRegistrationWithoutAttendant(body, incompleteCamper, allBodyKeys);
            } else if (this.camperModel.onlyAllowedKeys(body, missingExpectedBodyKeys) && attendantExistsInPayload) {
                response = await this.camperModel.continueRegistrationWithAttendant(body, incompleteCamper, missingExpectedAttendantKeys, allBodyKeys, allAttendantKeys);
            };

            res.status(200).json({ msg: `éxito (camper actualizado en la base de datos)`, response: response[0], data: response[1] });
        } catch (err) {
            res.status(500).json({ error: err.message });
        };
    };
};

module.exports = { CamperController };