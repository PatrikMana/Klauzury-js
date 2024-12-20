const User = require('../models/User');
const Transaction = require('../models/Transaction');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Funkce pro registraci nového uživatele
exports.registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Uživatel pod tímto jménem už existuje' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      createdAt: new Date(),
    });

    res.status(201).json({ message: 'Uživatel byl úspěšně registrován.', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Chyba při registraci.', error });
  }
};

// Funkce pro přihlášení uživatele
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Nesprávné přihlašovací údaje.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Nesprávné přihlašovací údaje.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Přihlášení bylo úspěšné.', token });
  } catch (error) {
    console.error('Chyba při přihlášení uživatele:', error);
    res.status(500).json({ message: 'Chyba serveru.' });
  }
};

// Funkce pro získání zůstatku uživatele
exports.getUserBalance = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Uživatel není ověřen.' });
    }

    const userId = req.user.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Uživatel nenalezen.' });
    }

    const uncreditedTransactions = await Transaction.findAll({
      where: {
        userId,
        credited: false,
      },
    });

    let totalUpdate = 0;

    for (const transaction of uncreditedTransactions) {
      totalUpdate += parseFloat(transaction.amount);
      transaction.credited = true;
      await transaction.save();
    }

    if (totalUpdate !== 0) {
      const updatedBalance = parseFloat(user.accountBalance) + totalUpdate;
      user.accountBalance = parseFloat(updatedBalance.toFixed(2));
      await user.save();
    }

    res.status(200).json({
      accountBalance: user.accountBalance,
      accountGoal: user.accountGoal,
    });
  } catch (error) {
    console.error('Chyba při načítání zůstatku uživatele:', error);
    res.status(500).json({ message: 'Chyba serveru.' });
  }
};

// Funkce pro aktualizaci zůstatku uživatele
exports.updateBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountBalance, accountGoal } = req.body;

    if (!accountBalance || !accountGoal) {
      return res.status(400).json({ message: 'Vyplňte zůstatek a cílovou částku.' });
    }

    await User.update(
      { accountBalance, accountGoal },
      { where: { id: userId } }
    );

    const updatedUser = await User.findByPk(userId);
    res.status(200).json({
      accountBalance: updatedUser.accountBalance,
      accountGoal: updatedUser.accountGoal,
    });
  } catch (error) {
    console.error('Chyba při aktualizaci zůstatku:', error);
    res.status(500).json({ message: 'Chyba serveru.' });
  }
};

// Funkce pro získání profilu uživatele
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username'],
    });

    if (!user) {
      return res.status(404).json({ message: 'Uživatel nenalezen.' });
    }

    res.json({
      username: user.username
    });
  } catch (error) {
    console.error('Chyba při získávání profilu:', error);
    res.status(500).json({ message: 'Chyba serveru.' });
  }
};