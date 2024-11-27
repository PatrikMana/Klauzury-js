const express = require('express');
const router = express.Router();
const budgetSimulationController = require('../controllers/budgetSimulationController');

router.post('/', budgetSimulationController.createSimulation);
router.get('/', budgetSimulationController.getSimulations);
router.get('/:id', budgetSimulationController.getSimulationById);
router.put('/:id', budgetSimulationController.updateSimulation);
router.delete('/:id', budgetSimulationController.deleteSimulation);

router.post('/confirm/:id', budgetSimulationController.confirmSimulation);

module.exports = router;