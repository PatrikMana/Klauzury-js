const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Definice modelu uživatele
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  accountBalance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  accountGoal: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
});

module.exports = User;