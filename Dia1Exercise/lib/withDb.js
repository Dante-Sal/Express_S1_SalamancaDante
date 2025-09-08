const { connect, disconnect } = require('./db');

async function withDb(fn) {
    try {
        const db = await connect();
        return await fn(db);
    } catch (err) {
        throw err;
    } finally {
        await disconnect();
    };
};

module.exports = { withDb };