import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const League = sequelize.define('League', {
    id_league: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  private: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  shared_link:{
    type : DataTypes.STRING
  },
  active:{
    type : DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
}, {
  tableName: 'leagues',
  timestamps: true,
  createdAt: true,
  updatedAt: true
});

export default League;