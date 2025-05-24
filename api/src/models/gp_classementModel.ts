import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const GP_Classement = sequelize.define('GP_Classement', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_gp: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_gp_pilote: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  position: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'gp_classement',
  timestamps: true,
  createdAt: true,
  updatedAt: true
});

export default GP_Classement;