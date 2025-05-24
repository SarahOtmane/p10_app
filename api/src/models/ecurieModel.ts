import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const Ecurie = sequelize.define('Ecurie', {
  id_api_ecurie: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  short_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'ecuries',
  timestamps: true,
  createdAt: true,
  updatedAt: true
});

export default Ecurie;