function isPlainObject(x) {
    if (Object.prototype.toString.call(x) !== `[object Object]`) return false;
    const proto = Object.getPrototypeOf(x);
    return proto === Object.prototype;
};

module.exports = { isPlainObject };