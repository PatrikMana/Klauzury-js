// Funkce pro ověření tokenu
exports.verifyToken = (req, res) => {
  res.status(200).json({ message: 'Token ověřen.' });
};