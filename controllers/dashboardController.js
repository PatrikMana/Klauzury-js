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
    const userId = req.user.id;
    console.log('ID uživatele:', userId);

    // Získání aktuálního měsíce
    const currentMonth = new Date().getMonth() + 1;
    console.log('Aktuální měsíc:', currentMonth);

    // Určení začátku a konce měsíce
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    // Načtení transakcí pro aktuální měsíc
    const transactions = await Transaction.findAll({
      where: {
        userId,
        createdAt: {
          [Op.gte]: startOfMonth,
          [Op.lt]: endOfMonth,
        },
      },
    });

    if (!transactions || transactions.length === 0) {
      console.error('Žádné transakce nebyly nalezeny.');
      return res.status(404).json({ message: 'Žádné transakce nebyly nalezeny.' });
    }

    console.log('Načtené transakce:', transactions);

    // Výpočet příjmů a výdajů
    let income = 0;
    let expenses = 0;

    transactions.forEach((transaction) => {
      if (transaction.amount > 0) {
        income += parseFloat(transaction.amount);
      } else {
        expenses += parseFloat(transaction.amount);
      }
    });

    // Odeslání odpovědi
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