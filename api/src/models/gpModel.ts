import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const GP = sequelize.define('GP', {
  id_api_races: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
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
  tableName: 'gps',
  timestamps: true,
  createdAt: true,
  updatedAt: true
});

import Tracks from './trackModel';
GP.belongsTo(Tracks, { foreignKey: 'id_api_track' });
Tracks.hasMany(GP, { foreignKey: 'id_api_track' });

export default GP;