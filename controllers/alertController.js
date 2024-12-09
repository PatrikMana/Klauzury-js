const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Funkce pro získání alertů pro uživatele
exports.getAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId); 
    const transactions = await Transaction.findAll({ where: { userId } });

    if (!user) {
      return res.status(404).json({ message: 'Uživatel nenalezen.' }); 
    }

    const alerts = [];

    // Kontrola nízkého zůstatku
    if (user.accountBalance < 100) {
      alerts.push({
        message: 'Váš zůstatek je pod 100 Kč. Doporučujeme zkontrolovat výdaje.',
      });
    }

    // Kontrola záporného zůstatku
    if (user.accountBalance < 0) {
      alerts.push({
        message: 'Váš zůstatek je záporný. Doplňte prostředky.',
      });
    }

    // Kontrola měsíčního záporného zůstatku
    const monthlyExpenses = transactions
      .filter(t => t.amount < 0 && isCurrentMonth(t.date))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const monthlyIncome = transactions
      .filter(t => t.amount > 0 && isCurrentMonth(t.date))
      .reduce((sum, t) => sum + t.amount, 0);

    if (monthlyExpenses > monthlyIncome) {
      alerts.push({
        message: 'Vaše výdaje za tento měsíc překračují příjmy. Zvažte úpravu rozpočtu.',
      });
    }

    // Kontrola splnění cíle
    if (user.accountBalance >= user.accountGoal) {
      alerts.push({
        message: 'Gratulujeme! Dosáhli jste svého cíle.',
      });
    }

    // Kontrola nastávajících transakcí
    const upcomingTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const today = new Date();
      const differenceInDays = (transactionDate - today) / (1000 * 60 * 60 * 24);
      return differenceInDays > 0 && differenceInDays <= 3;
    });

    upcomingTransactions.forEach(transaction => {
      alerts.push({
        type: 'info',
        message: `Blíží se transakce '${transaction.name}' ve výši ${transaction.amount} Kč, plánovaná na ${transaction.date}.`,
      });
    });

    res.status(200).json(alerts);
  } catch (error) {
    console.error('Chyba při získávání alertů:', error);
    res.status(500).json({ message: 'Chyba serveru.' });
  }
};

// Pomocná funkce pro kontrolu aktuálního měsíce
function isCurrentMonth(date) {
  const now = new Date();
  const transactionDate = new Date(date);
  return (
    transactionDate.getMonth() === now.getMonth() &&
    transactionDate.getFullYear() === now.getFullYear()
  );
}