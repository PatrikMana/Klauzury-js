const Transaction = require('../models/Transaction');

exports.getBalance = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({ where: { userId: req.user.id } });
    const balance = transactions.reduce((sum, t) => sum + t.amount, 0);
    res.status(200).json({ balance });
  } catch (error) {
    console.error('Chyba při získávání zůstatku:', error);
    res.status(500).json({ message: 'Chyba při získávání zůstatku.' });
  }
};

exports.getMonthlySummary = async (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const transactions = await Transaction.findAll({ where: { userId: req.user.id } });
    const income = transactions
      .filter(t => t.amount > 0 && new Date(t.date).getMonth() + 1 === currentMonth)
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.amount < 0 && new Date(t.date).getMonth() + 1 === currentMonth)
      .reduce((sum, t) => sum + t.amount, 0);
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
    