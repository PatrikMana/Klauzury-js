const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Definice modelu transakce
const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  recurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  credited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, 
  },
});

// Asociace s modelem User
Transaction.associate = (models) => {
  Transaction.belongsTo(models.User, { foreignKey: 'userId' });
};

module.exports = Transaction;