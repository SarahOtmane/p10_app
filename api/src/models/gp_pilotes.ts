import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const GP_Pilotes = sequelize.define('GP_Pilotes', {
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
  tableName: 'gp_pilotes',
  timestamps: true,
  createdAt: true,
  updatedAt: true
});

export default GP_Pilotes;