import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const Results = sequelize.define('Results', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_gp: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  point_p10: {
    type: DataTypes.STRING,
    allowNull: false
  },
  id_pilote_p10: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
}, {
  tableName: 'results',
  timestamps: true,
  createdAt: true,
  updatedAt: true
});

export default Results;