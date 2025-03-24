import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const Tracks = sequelize.define('Tracks', {
  id_api_races: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  country_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  track_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  picture_country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  picture_track: {
    type: DataTypes.STRING, 
    allowNull: true
  }
}, {
  tableName: 'tracks',
  timestamps: true,
  createdAt: true,
  updatedAt: true
});

export default Tracks;