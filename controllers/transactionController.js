const Transaction = require('../models/Transaction'); // Ujisti se, že správně importuješ model

// Funkce pro přidání nové transakce
exports.addTransaction = async (req, res) => {
  const { name, amount, date, isRecurring, type } = req.body;
  const userId = req.user.id; // Získáme ID uživatele z tokenu

  try {
    // Pokusíme se vytvořit novou transakci v databázi
    const transaction = await Transaction.create({
      userId,
      name,
      amount,
      date,
      isRecurring,
      type,
    });

    // Pokud je transakce vytvořena, vrátíme ji zpět jako odpověď
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Chyba při přidávání transakce:', error);
    res.status(500).json({ message: 'Chyba serveru při přidávání transakce.' });
  }
};