const { Router } = require('express');
const { campers } = require('./camperRoutes');

const campersRouter = Router();

campersRouter.use('/campers', campers);

module.exports = campersRouter;