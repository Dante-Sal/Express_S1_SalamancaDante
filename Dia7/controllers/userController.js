require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UserModel } = require('../models/userModel');

class UserController {
    constructor() {
        this.userModel = new UserModel();
    };

    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            const userExists = await this.userModel.findUserByEmail(email);

            if (userExists) return res.status(400).json({ error: `User already exists` });

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await this.userModel.createUser({ name, email, password: hashedPassword });

            res.status(201).json({ msg: `User created`, newUser });
        } catch (err) {
            res.status(500).json({ error: err.message });
        };
    };

    async login(req, res) {
        try {
            const { name, email, password } = req.body;
            const userExists = await this.userModel.findUserByEmail(email);

            if (!userExists) return res.status(404).json({ error: `User not found` });

            const passwordIsValid = await bcrypt.compare(password, userExists.password);

            if (!passwordIsValid) return res.status(401).json({ error: `Access unauthorized` });

            const token = jwt.sign(
                { id: userExists._id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES }
            );

            res.status(202).json({ msg: `Access accepted`, token, expiresIn: process.env.JWT_EXPIRES });
        } catch (err) {
            res.status(500).json({ error: err.message });
        };
    };

    async updateUser(req, res) {
        try {
            const { id } = req.user;
            const { name, email } = req.body;

            await this.userModel.updateUser(id, { name, email });

            res.status(200).json({ msg: `User updated` });
        } catch (err) {
            res.status(500).json({ error: err.message });
        };
    };

    async updatePassword(req, res) {
        try {
            const { id } = req.user;
            const { password } = req.body;

            const hashedPassword = await bcrypt.hash(password, 10);
            await this.userModel.updatePassword(id, { password: hashedPassword });

            res.status(200).json({ msg: `Password updated` });
        } catch (err) {
            res.status(500).json({ error: err.message });
        };
    };
};

module.exports = { UserController };