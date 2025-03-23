import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const PilotesEcurie = sequelize.define('PilotesEcurie', {
    id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  id_pilote: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_ecurie: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'pilotes_ecuries',
  timestamps: true,
  createdAt: true,
  updatedAt: true
});

export default PilotesEcurie;