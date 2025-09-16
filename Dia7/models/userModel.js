require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

class UserModel {
    constructor() {
        this.client = new MongoClient(process.env.MONGODB_URI);
        this.dbName = process.env.MONGODB_DATABASE;
    };

    async connect() {
        if (!this.client.topology?.isConnected()) await this.client.connect();
        return this.client.db(this.dbName).collection(`users`);
    };

    async findAll() {
        const collection = await this.connect();
        return await collection.find().toArray();
    };

    async findUserById(_id) {
        const collection = await this.connect();
        return await collection.findOne({ _id: new ObjectId(_id) });
    };

    async findUserByEmail(email) {
        const collection = await this.connect();
        return await collection.findOne({ email });
    };

    async createUser(userData) {
        const collection = await this.connect();
        return await collection.insertOne(userData);
    };

    async updateUser(_id, userData) {
        const collection = await this.connect();
        return await collection.replaceOne({ _id: new ObjectId(_id) }, userData);
    };

    async updatePassword(_id, password) {
        const collection = await this.connect();
        return await collection.updateOne({ _id: new ObjectId(_id) }, { $set: { password } });
    };

    async deleteUser(_id) {
        const collection = await this.connect();
        return await collection.deleteOne({ _id: new ObjectId(_id) });
    };
};

module.exports = { UserModel };