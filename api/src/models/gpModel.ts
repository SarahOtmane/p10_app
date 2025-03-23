import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const GP = sequelize.define('GP', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  id_gp: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_pilote: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_ecurie: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  tableName: 'gps',
  timestamps: true,
  createdAt: true,
  updatedAt: true
});

export default GP;