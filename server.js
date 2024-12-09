require('dotenv').config();

const express = require('express');
const sequelize = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const authRoutes = require('./routes/authRoutes');
const path = require('path');
const dashboardRoutes = require('./routes/dashboardRoutes');
const alertRoutes = require('./routes/alertRoutes');

const app = express();

app.use(express.json());
app.use(express.static('public'));

// Definice routu pro hlavní stránku
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Definice routů pro API
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alerts', alertRoutes);

// Připojení k databázi
sequelize.authenticate()
  .then(() => console.log('Připojení k databázi bylo úspěšné!'))
  .catch(error => console.error('Připojení k databázi selhalo:', error));

// Synchronizace databáze a spuštění serveru
sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('http://localhost:3000');
  });
});