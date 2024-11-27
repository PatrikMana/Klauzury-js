const Transaction = require('../models/Transaction');

exports.createTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Chyba při vytváření transakce.', error });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Chyba při získávání transakcí.', error });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.update(req.body, { where: { id: req.params.id } });
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Chyba při aktualizaci transakce.', error });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    await Transaction.destroy({ where: { id: req.params.id } });
    res.status(200).json({ message: 'Transakce byla smazána.' });
  } catch (error) {
    res.status(500).json({ message: 'Chyba při mazání transakce.', error });
  }
};