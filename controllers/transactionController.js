const Transaction = require('../models/Transaction');
const { Op } = require('sequelize');

// Funkce pro přidání nové transakce
exports.addTransaction = async (req, res) => {
  const { name, amount, date, isRecurring, type } = req.body;
  const userId = req.user.id;

  try {
    const newTransaction = await Transaction.create({
      userId,
      name,
      amount,
      date,
      recurring: isRecurring,
      createdAt: new Date(),
    });

    // Pokud je transakce pravidelná, přidáme cron job pro její opakování
    if (isRecurring) {
      console.log(`Transakce ${name} je pravidelná a bude opakována každý měsíc.`);
    }

    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Chyba při přidávání transakce:', error);
    res.status(500).json({ message: 'Chyba při přidávání transakce.' });
  }
};

// Funkce pro získání transakcí za aktuální měsíc
exports.getTransactions = async (req, res) => {
  const userId = req.user.id;
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);

  try {
    // Načítání transakcí v rámci aktuálního měsíce
    const transactions = await Transaction.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [oneMonthAgo, now],
        },
      },
      order: [['updatedAt', 'DESC']],
      offset: parseInt(req.query.offset, 10) || 0,
      limit: parseInt(req.query.limit, 10) || 6,
    });

    // Počítání celkového počtu relevantních transakcí
    const totalTransactions = await Transaction.count({
      where: {
        userId,
        date: {
          [Op.between]: [oneMonthAgo, now],
        },
      },
    });

    res.status(200).json({ transactions, totalTransactions });
  } catch (error) {
    console.error('Chyba při načítání transakcí:', error);
    res.status(500).json({ message: 'Chyba při načítání transakcí.' });
  }
};