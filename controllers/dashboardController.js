const Transaction = require('../models/Transaction');
const { Op } = require('sequelize');

// Funkce pro získání měsíčního přehledu transakcí
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
          [Op.between]: [oneMonthAgo, now],
        },
      },
    });

    // Mazání nepravidelných transakcí starších než jeden měsíc
    await Transaction.destroy({
      where: {
        userId,
        recurring: false,
        date: {
          [Op.lt]: oneMonthAgo,
        },
      },
    });

    // Pravidelné transakce: Aktualizace nebo ignorování
    const recurringTransactions = await Transaction.findAll({
      where: {
        userId,
        recurring: true,
        date: {
          [Op.lte]: now,
        },
      },
    });

    for (const transaction of recurringTransactions) {
      if (new Date(transaction.updatedAt) < oneMonthAgo) {
        // Aktualizace `updatedAt` a `date` pro pravidelné transakce, které nebyly započítány
        const updatedDate = new Date(transaction.updatedAt);
        updatedDate.setMonth(now.getMonth());
        updatedDate.setFullYear(now.getFullYear());

        transaction.updatedAt = updatedDate;
        transaction.date = updatedDate;
        transaction.credited = false;
        await transaction.save();
      }
    }

    // Ignorovat budoucí transakce
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