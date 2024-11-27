const jwt = require('jsonwebtoken');

exports.checkToken = (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Token nebyl poskytnut.' });
      }
  
      const decoded = jwt.verify(token, 'tvujtajnyklic');
      res.status(200).json({ message: 'Token je platný.', user: decoded });
    } catch (error) {
      res.status(401).json({ message: 'Token je neplatný nebo vypršel.' });
    }
  };  