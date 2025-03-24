import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user',
  },
  id_avatar: {
    type: DataTypes.UUID,
    allowNull: true,
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

import Avatar from './avatarModel';
import League from './leagueModel';
import UserLeague from './user_leagueModel';

User.belongsTo(Avatar, { foreignKey: 'id_avatar' });
Avatar.hasMany(User, { foreignKey: 'id_avatar' });

User.belongsToMany(League, {
  through: UserLeague,
  foreignKey: 'id_user',
  otherKey: 'id_league',
});
League.belongsToMany(User, {
  through: UserLeague,
  foreignKey: 'id_league',
  otherKey: 'id_user',
});

export default User;
