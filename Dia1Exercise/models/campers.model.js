class CamperModel {
    static BODY_EXPECTED_KEYS = [`nombres`, `apellidos`, `telefono`, `direccion`, `acudiente`, `jornada`];
    static ATTENDANT_EXPECTED_KEYS = [`nombres`, `apellidos`, `telefono`];

    static PATTERNS = {
        nombres: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/,
        apellidos: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/,
        direccion: /^\S[\s\S]*\S$/,
        telefono: /^3[0-9]{9}$/
    };

    static PATT_ERR_MESSAGES = {
        nombres: `número de palabras superior a 2 en 'nombres'`,
        apellidos: `número de palabras diferente de 2 en 'apellidos'`,
        direccion: `'direccion' vacía`,
        telefono: `formato inválido en 'telefono'`
    };

    static clean(object) {
        return Object.fromEntries(Object.entries(object ?? {}).filter(([key, value]) => value != null));
    };

    static isPlainObject(x) {
        if (Object.prototype.toString.call(x) !== `[object Object]`) return false;
        const proto = Object.getPrototypeOf(x);
        return proto === Object.prototype;
    };

    static onlyAllowedKeys(object, allowedKeys) {
        if (!this.isPlainObject(object)) return false;
        const allowed = new Set(allowedKeys);
        return Object.keys(object).every(k => allowed.has(k));
    };

    static validateStrings(value, pattern, errMsgs, errors) {
        if (value == null) return errors;
        if (typeof value !== `string`) { errors.push(errMsgs[0]); return errors };
        if (!pattern.test(value.trim())) errors.push(errMsgs[1]);
        return errors;
    };

    static validateAllStringFields(fields, object, errors) {
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

    static validateStart(input) {
        let errors = [];
        const body = this.clean(input);
        const bodyKeys = Object.keys(body);

        if (bodyKeys.length < 1) errors.push(`solicitud inválida (datos insuficientes en el cuerpo)`);

        if ((bodyKeys.length === 6 && this.BODY_EXPECTED_KEYS.every(key => bodyKeys.includes(key))) ||
            (bodyKeys.length < 6 && this.onlyAllowedKeys(body, this.BODY_EXPECTED_KEYS))) {
            errors = this.validateAllStringFields(this.PATTERNS, body, errors);

            if (this.isPlainObject(body.acudiente) || body.acudiente == null) {
                body.acudiente = this.clean(body.acudiente);
                const attendantKeys = Object.keys(body.acudiente);

                if ((attendantKeys.length === 3 && this.ATTENDANT_EXPECTED_KEYS.every(key => attendantKeys.includes(key))) ||
                    (attendantKeys.length < 3 && this.onlyAllowedKeys(body.acudiente, this.ATTENDANT_EXPECTED_KEYS))) {
                    errors = this.validateAllStringFields(this.ATTENDANT_EXPECTED_KEYS, body.acudiente, errors);
                } else {
                    errors.push(`solicitud inválida (claves no permitidas en 'acudiente')`);
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
            errors.push(`solicitud inválida (claves no permitidas en el body)`);
        };

        return { ok: errors.length === 0, errors, body };
    };
};

module.exports = { CamperModel };