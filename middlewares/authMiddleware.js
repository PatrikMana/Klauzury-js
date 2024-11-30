const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Sequelize model pro uživatele

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Získání tokenu z hlavičky

    if (!token) {
      return res.status(401).json({ message: 'Token chybí.' });
    }

    const decoded = jwt.verify(token, 'tajnyklic'); // Ověření tokenu
    const user = await User.findByPk(decoded.id); // Načtení uživatele podle ID

    if (!user) {
      return res.status(401).json({ message: 'Uživatel neexistuje.' });
    }

    req.user = user; // Přidání uživatele do požadavku
    next(); // Pokračování na další middleware nebo kontroler
  } catch (error) {
    console.error('Chyba při ověřování tokenu:', error);
    res.status(401).json({ message: 'Token je neplatný nebo vypršel.' });
  }
};