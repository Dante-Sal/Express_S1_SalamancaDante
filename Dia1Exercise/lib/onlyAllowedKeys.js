const { isPlainObject } = require('./isPlainObject');

function onlyAllowedKeys(obj, allowedKeys) {
    if (!isPlainObject(obj)) return false;
    const allowed = new Set(allowedKeys);
    return Object.keys(obj).every(k => allowed.has(k));
};

module.exports = { onlyAllowedKeys };