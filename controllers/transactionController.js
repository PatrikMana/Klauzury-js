const { Transaction } = require('../models/transaction');  // Importujeme správný model pro transakci

// Funkce pro přidání nové transakce
exports.addTransaction = async (req, res) => {
  const { name, amount, date, isRecurring, type } = req.body;
  const userId = req.user.id; // Získáme ID uživatele z tokenu

  try {
    // Vytvoření nové transakce v databázi
    const transaction = await Transaction.create({
      userId,
      name,
      amount,
      date,
      isRecurring,
      type,
    });

    res.status(201).json(transaction); // Vrátíme vytvořenou transakci jako odpověď
  } catch (error) {
    console.error('Chyba při přidávání transakce:', error);
    res.status(500).json({ message: 'Chyba serveru při přidávání transakce.' });
  }
};