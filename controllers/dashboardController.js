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
  const userId = req.user.id;
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);

  try {
    // Načíst transakce relevantní pro aktuální měsíc
    const relevantTransactions = await Transaction.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [oneMonthAgo, now], // Transakce za poslední měsíc
        },
      },
    });

    // Mazání nepravidelných transakcí starších než jeden měsíc
    await Transaction.destroy({
      where: {
        userId,
        recurring: false,
        date: {
          [Op.lt]: oneMonthAgo, // Starší než jeden měsíc
        },
      },
    });

    // Pravidelné transakce: Aktualizace nebo ignorování
    const recurringTransactions = await Transaction.findAll({
      where: {
        userId,
        recurring: true,
        date: {
          [Op.lte]: now, // Starší nebo rovno dnešnímu dni
        },
      },
    });

    for (const transaction of recurringTransactions) {
      if (new Date(transaction.updatedAt) < oneMonthAgo) {
        // Pokud pravidelná transakce nebyla započítána, aktualizujeme `updatedAt`
        const updatedDate = new Date(transaction.updatedAt);
        updatedDate.setMonth(now.getMonth()); // Nastavíme aktuální měsíc
        updatedDate.setFullYear(now.getFullYear()); // Nastavíme aktuální rok

        transaction.updatedAt = updatedDate;
        transaction.date = updatedDate; // Aktualizujeme datum na dnešní
        transaction.credited = false; // Nastavíme jako nezapočtenou
        await transaction.save(); // Uložíme aktualizaci
      }
    }

    // Ignorovat budoucí transakce (už je nebudeme počítat)
    const validTransactions = relevantTransactions.filter(transaction => {
      return transaction.date <= now;
    });

    const income = validTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const expenses = validTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const formattedIncome = parseFloat(income.toFixed(2));
    const formattedExpenses = parseFloat(expenses.toFixed(2));

    res.status(200).json({
      income: formattedIncome, 
      expenses: formattedExpenses
    });
  } catch (error) {
    console.error('Error while getting monthly summary:', error);
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