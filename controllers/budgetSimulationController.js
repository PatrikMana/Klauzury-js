const BudgetSimulation = require('../models/BudgetSimulation');
const Transaction = require('../models/Transaction');

exports.getSimulations = async (req, res) => {
  try {
    const simulations = await BudgetSimulation.findAll({
      where: { userId: req.body.userId },
    });
    res.status(200).json(simulations);
  } catch (error) {
    res.status(500).json({ message: 'Chyba při získávání simulací.', error });
  }
};

exports.getSimulationById = async (req, res) => {
    try {
      const simulationId = req.params.id;
      const simulation = await BudgetSimulation.findByPk(simulationId);
  
      if (!simulation) {
        return res.status(404).json({ message: 'Simulace nebyla nalezena.' });
      }
  
      res.status(200).json(simulation);
    } catch (error) {
      res.status(500).json({ message: 'Chyba při získávání simulace.', error });
    }
  };  

exports.createSimulation = async (req, res) => {
  try {
    const simulation = await BudgetSimulation.create(req.body);
    res.status(201).json(simulation);
  } catch (error) {
    res.status(500).json({ message: 'Chyba při vytváření simulace.', error });
  }
};

exports.updateSimulation = async (req, res) => {
    try {
      const simulationId = req.params.id;
      const { name, amount, recurring } = req.body;
  
      const simulation = await BudgetSimulation.findByPk(simulationId);
      if (!simulation) {
        return res.status(404).json({ message: 'Simulace nebyla nalezena.' });
      }
  
      await simulation.update({ name, amount, recurring });
  
      res.status(200).json({ message: 'Simulace byla úspěšně aktualizována.', simulation });
    } catch (error) {
      res.status(500).json({ message: 'Chyba při aktualizaci simulace.', error });
    }
  };  

exports.deleteSimulation = async (req, res) => {
  try {
    const simulationId = req.params.id;
    const deleted = await BudgetSimulation.destroy({ where: { id: simulationId } });
    if (!deleted) {
      return res.status(404).json({ message: 'Simulace nenalezena.' });
    }
    res.status(200).json({ message: 'Simulace byla úspěšně smazána.' });
  } catch (error) {
    res.status(500).json({ message: 'Chyba při mazání simulace.', error });
  }
};

exports.confirmSimulation = async (req, res) => {
  try {
    const simulationId = req.params.id;

    const simulation = await BudgetSimulation.findByPk(simulationId);
    if (!simulation) {
      return res.status(404).json({ message: 'Simulace nebyla nalezena.' });
    }

    const newTransaction = await Transaction.create({
      userId: simulation.userId,
      name: simulation.name,
      amount: simulation.amount,
      recurring: simulation.recurring,
      date: simulation.createdAt, 
      createdAt: new Date(),
    });

    await simulation.destroy();

    res.status(201).json({
      message: 'Simulace byla úspěšně potvrzena a přidána do transakcí.',
      transaction: newTransaction,
    });
  } catch (error) {
    res.status(500).json({ message: 'Chyba při potvrzení simulace.', error });
  }
};