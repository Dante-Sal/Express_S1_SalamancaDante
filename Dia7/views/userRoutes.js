require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const { UserController } = require('../controllers/userController');

const router = express.Router();
const userController = new UserController();

function authMiddleware(req, res, next) {
    const headers = req.headers;
    const token = headers.authorization;
    if (!token) return res.status(403).json({ error: `Token required` });
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) res.status(401).json({ error: `Access unauthorized` });
        req.user = decoded;
        next();
    });
};

router.post(`/register`, (req, res) => userController.register(req, res));
router.post(`/login`, (req, res) => userController.login(req, res));
router.put(`/update`, authMiddleware, (req, res) => userController.updateUser(req, res));
router.put(`/update-password`, authMiddleware, (req, res) => userController.updatePassword(req, res));

module.exports = router;