import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const GP_Pilotes = sequelize.define('GP_Pilotes', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  season: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  id_api_track: {
    type: DataTypes.INTEGER, 
    allowNull: true
  }
}, {
  tableName: 'gp_pilotes',
  timestamps: true,
  createdAt: true,
  updatedAt: true
});

export default GP_Pilotes;