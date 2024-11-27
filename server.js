const express = require('express');
const sequelize = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetSimulationRoutes = require('./routes/budgetSimulationRoutes');
const authRoutes = require('./routes/authRoutes');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budget-simulations', budgetSimulationRoutes);
app.use('/api/auth', authRoutes);


sequelize.authenticate()
  .then(() => console.log('Připojení k databázi bylo úspěšné!'))
  .catch(error => console.error('Připojení k databázi selhalo:', error));

sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Server běží na http://localhost:3000');
  });
});