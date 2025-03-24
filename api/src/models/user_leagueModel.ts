import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const UserLeague = sequelize.define('UserLeague', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user',
    validate: {
      isIn: [['user', 'admin']] 
    }
  }
}, {
  tableName: 'user_leagues',
  timestamps: true,
  createdAt: true,
  updatedAt: true
});

export default UserLeague;
