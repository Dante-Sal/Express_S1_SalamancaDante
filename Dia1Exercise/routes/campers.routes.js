const { Router } = require('express');
const ctrl = require('../controllers/campers.controller');

const campersRouter = Router();
const camperRouter = Router();

campersRouter.get('/', ctrl.list);
campersRouter.get('/count', ctrl.count);
campersRouter.get('/:id', ctrl.getByParamsId);
camperRouter.post('/', ctrl.getByBodyId);
campersRouter.post('/', ctrl.startRegistration);
campersRouter.patch('/continue', ctrl.continueRegistration);

module.exports = { campersRouter, camperRouter };