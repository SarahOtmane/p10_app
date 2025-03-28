import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const Avatar = sequelize.define('Avatar', {
  id_avatar: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  picture_avatar: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'avatars',
  timestamps: true,
  createdAt: true,
  updatedAt: true
});

export default Avatar;