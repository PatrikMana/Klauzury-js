const Transaction = require('../models/Transaction'); // Ujisti se, že správně importuješ model
const cron = require('node-cron'); // Naimportujeme node-cron

// Funkce pro přidání nové transakce
exports.addTransaction = async (req, res) => {
  const { name, amount, date, isRecurring, type } = req.body;
  const userId = req.user.id; // Získáme uživatelské ID z tokenu

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

// Cron job pro opakující se transakce
cron.schedule('0 0 1 * *', async () => {
  try {
    // Najdeme všechny pravidelné transakce (recurring: true)
    const recurringTransactions = await Transaction.findAll({
      where: { recurring: true },
    });

    // Pro každou pravidelnou transakci vytvoříme novou pro tento měsíc
    recurringTransactions.forEach(async (transaction) => {
      // Vytvoříme novou transakci s příslušnými parametry
      await Transaction.create({
        userId: transaction.userId,
        name: transaction.name,
        amount: transaction.amount,
        date: new Date(), // Nové datum pro tento měsíc
        recurring: true,  // Oznacujeme jako pravidelnou
        createdAt: new Date(),
      });

      console.log(`Pravidelná transakce pro ${transaction.name} byla přidána.`);
    });
  } catch (error) {
    console.error('Chyba při opakování transakcí:', error);
  }
});

// Cron job pro opakující se transakce
cron.schedule('0 0 1 * *', async () => {
  try {
    // Najdeme všechny pravidelné transakce (recurring: true)
    const recurringTransactions = await Transaction.findAll({
      where: { recurring: true },
    });

    // Pro každou pravidelnou transakci vytvoříme novou pro tento měsíc
    recurringTransactions.forEach(async (transaction) => {
      // Vytvoříme novou transakci s příslušnými parametry
      await Transaction.create({
        userId: transaction.userId,
        name: transaction.name,
        amount: transaction.amount,
        date: new Date(), // Nové datum pro tento měsíc
        recurring: true,  // Oznacujeme jako pravidelnou
        createdAt: new Date(),
      });

      console.log(`Pravidelná transakce pro ${transaction.name} byla přidána.`);
    });
  } catch (error) {
    console.error('Chyba při opakování transakcí:', error);
  }
});

exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Načteme transakce pro uživatele s limitem 6
    const transactions = await Transaction.findAll({
      where: { userId },
      limit: 6,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Chyba při načítání transakcí:', error);
    res.status(500).json({ message: 'Chyba při načítání transakcí.' });
  }
};