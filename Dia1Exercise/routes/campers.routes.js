const { Router } = require('express');
const ctrl = require('../controllers/campers.controller');

const campers = Router();
const camper = Router();

campers.get('/', ctrl.list);
campers.get('/count', ctrl.count);
campers.get('/:id', ctrl.getByParamsId);
camper.post('/', ctrl.getByBodyId);
campers.post('/', ctrl.startRegistration);
campers.patch('/continue', ctrl.continueRegistration);

module.exports = { campers, camper };