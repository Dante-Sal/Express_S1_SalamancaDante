require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.URI;
const dbName = process.env.DATABASE;

if (!uri) throw new Error(`[ERROR] Falta variable de entorno 'URI' (verificar archivo '.env')`);
if (!dbName) throw new Error(`[ERROR] Falta variable de entorno 'DATABASE' (verificar archivo '.env')`);

let client = null;
let db = null;

async function connect() {
    try {
        if (db) return db;

        if (!client) {
            client = new MongoClient(uri);
            await client.connect();
        };

        db = client.db(dbName);

        if (process.stdout.isTTY) {
            process.stdout.write('\x1b[2J\x1b[3J\x1b[H');
        } else {
            console.clear();
        };

        console.info(`[INFO] Éxito en la conexión a la base de datos!`);

        return db;
    } catch (err) {
        console.error(`[ERROR] Fallo en la conexión a la base de datos: ${err.message}`);
        throw err;
    };
};

async function disconnect() {
    if (client) {
        await client.close();
        client = null;
        db = null;
    };
};

module.exports = { connect, disconnect };