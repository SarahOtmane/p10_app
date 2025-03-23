import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const Ecurie = sequelize.define('Ecurie', {
  id_api_ecurie: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'ecuries',
  timestamps: true,
  createdAt: true,
  updatedAt: true
});

export default Ecurie;