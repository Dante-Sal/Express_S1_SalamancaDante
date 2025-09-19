const { Router } = require('express');
const ctrl = require('../controllers/coordinatorController');

const coordinators = Router();

coordinators.get(`/auth`, ctrl.invalidAuthMethod);

coordinators.post(`/auth`, ctrl.auth);

coordinators.get(`/`, ctrl.list);

coordinators.get(`/count`, ctrl.count);

coordinators.get(`/:id`, ctrl.getById);

coordinators.get(`/campers`, campersCtrl.list);

coordinators.get(`/trainers`, trainersCtrl.list);

coordinators.get(`/campers/filter`, campersCtrl.filter);

coordinators.post(`/campers/grade_status/:grade_status`, campersCtrl.listByGradeStatus);

coordinators.get(`/route/:route/campers`, campersCtrl.listByRoute);

coordinators.get(`/route/:route/trainers`, trainersCtrl.listByRoute);

coordinators.get(`/campers/count`, campersCtrl.count);

coordinators.get(`/trainers/count`, trainersCtrl.count);

coordinators.get(`/campers/:id`, campersCtrl.getByParamsId);

coordinators.get(`/trainers/:id`, trainersCtrl.getByParamsId);

coordinators.post(`/camper`, campersCtrl.getByBodyId);

coordinators.post(`/trainer`, trainersCtrl.getByBodyId);

coordinators.post(`/campers`, campersCtrl.create);

coordinators.post(`/trainers`, trainersCtrl.create);

coordinators.patch(`/campers`, campersCtrl.update);

coordinators.patch(`/trainers`, trainersCtrl.update);

coordinators.delete(`/campers`, campersCtrl.delete);

coordinators.delete(`/trainers`, trainersCtrl.delete);

coordinators.post(`/campers/grades`, ctrl.assignGrades);