const { Router } = require('express');
const { campers, camper } = require('./campers.routes');

const campersRouter = Router();

campersRouter.use('/campers', campers);
campersRouter.use('/camper', camper);

module.exports = campersRouter;