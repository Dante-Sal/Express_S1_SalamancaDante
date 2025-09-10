class CamperModel {
    constructor() {
        this.NAMES_PATTERN = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/;
        this.SURNAMES_PATTERN = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/;
        this.TELEPHONE_NUMBER_PATTERN = /^3[0-9]{9}$/;

        this.BODY_EXPECTED_KEYS = [`nombres`, `apellidos`, `direccion`, `telefono`, `acudiente`, `jornada`];
        this.ATTENDANT_EXPECTED_KEYS = [`nombres`, `apellidos`, `telefono`];
    };

    static clean(object) {
        return Object.fromEntries(Object.entries(object).filter(([key, value]) => value != null));
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

    static validateStrings(value, pattern) {
        if (value != null) {
            if (typeof value !== `string`) return 1;
            if (!pattern.test(value.trim())) return 2;
        };

        return 0;
    };

    static validateStart(body) {
        const errors = [];
        const cleanBody = this.clean(body);
        const { nombres, apellidos, direccion, telefono, acudiente, jornada } = cleanBody;

        if (this.validateStrings(nombres, this.NAMES_PATTERN)) {
            switch (this.validateStrings(nombres, this.NAMES_PATTERN)) {
                case 1: errors.push(`solicitud inválida ('nombres' de tipo no string)`);
                case 2: errors.push(`solicitud inválida (número de palabras superior a 2 en 'nombres')`);
            };
        };

        if (this.validateStrings(apellidos, this.SURNAMES_PATTERN)) {
            switch (this.validateStrings(apellidos, this.SURNAMES_PATTERN)) {
                case 1: errors.push(`solicitud inválida ('apellidos' de tipo no string)`);
                case 2: errors.push(`solicitud inválida (número de palabras diferente de 2 en 'apellidos')`);
            };
        };
    };
};