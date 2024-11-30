const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'E-mail je již registrován.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    res.status(201).json({ message: 'Uživatel byl úspěšně registrován.', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Chyba při registraci.', error });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Nesprávné přihlašovací údaje.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Nesprávné přihlašovací údaje.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Přihlášení bylo úspěšné.', token });
  } catch (error) {
    console.error('Chyba při přihlášení uživatele:', error);
    res.status(500).json({ message: 'Chyba serveru.' });
  }
};

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

    res.status(200).json({ accountBalance: user.accountBalance });
  } catch (error) {
    console.error('Chyba při načítání zůstatku uživatele:', error);
    res.status(500).json({ message: 'Chyba serveru.' });
  }
};