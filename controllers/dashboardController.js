const Transaction = require('../models/Transaction');
const { Op } = require('sequelize');

exports.getBalance = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Uživatel není ověřen.' });
    }

    res.status(200).json({ accountBalance: req.user.accountBalance });
  } catch (error) {
    console.error('Chyba při načítání zůstatku uživatele:', error);
    res.status(500).json({ message: 'Chyba serveru.' });
  }
};

exports.getMonthlySummary = async (req, res) => {
  try {
    const userId = req.user.id;  // Získání ID uživatele z req.user
    const currentMonth = new Date().getMonth() + 1; // Měsíc je od 0, takže přidáme 1

    const transactions = await Transaction.findAll({
      where: {
        userId,
        createdAt: {
          [Op.gte]: new Date(new Date().getFullYear(), currentMonth - 1, 1), // Začátek měsíce
          [Op.lt]: new Date(new Date().getFullYear(), currentMonth, 0), // Konec měsíce
        },
      },
    });

    let income = 0;
    let expenses = 0;

    transactions.forEach((transaction) => {
      if (transaction.amount > 0) {
        income += parseFloat(transaction.amount);
      } else {
        expenses += parseFloat(transaction.amount);
      }
    });

    res.status(200).json({ income, expenses });
  } catch (error) {
    console.error('Chyba při získávání měsíčního přehledu:', error);
    res.status(500).json({ message: 'Chyba při získávání měsíčního přehledu.' });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const alerts = [
      { message: 'Splátka hypotéky za 7 dní.', type: 'warning' },
      { message: 'Plánovaná transakce: 5 000 Kč za 3 dny.', type: 'info' },
    ];
    res.status(200).json(alerts);
  } catch (error) {
    console.error('Chyba při získávání upozornění:', error);
    res.status(500).json({ message: 'Chyba při získávání upozornění.' });
  }
};