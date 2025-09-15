const mongoose = require('mongoose');

class Database {
    constructor(URI) {
        this.URI = URI;
    };

    async connect() {
        try {
            mongoose.set(`strictQuery`, true);
            await mongoose.connect(this.URI);
            console.log(`Éxito en la conexión a la base de datos!`);
        } catch (err) {
            console.log(`Error de conexión: ${err.message}`);
        };
    };

    async disconnect() {
        try {
            await mongoose.disconnect();
            console.log(`Éxito en la desconexión de la base de datos!`);
        } catch (err) {
            console.log(`Error de desconexión: ${err.message}`);
        };
    };
};

module.exports = { Database };