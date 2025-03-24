import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const Results = sequelize.define('Results', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_gp: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  point_p10: {
    type: DataTypes.STRING,
    allowNull: false
  },
  id_pilote_p10: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
}, {
  tableName: 'results',
  timestamps: true,
  createdAt: true,
  updatedAt: true
});

import User from './userModel';
import GP from './gpModel';
import Pilotes from './piloteModel';

Results.belongsTo(User, { foreignKey: 'id_user' });
User.hasMany(Results, { foreignKey: 'id_user' });

Results.belongsTo(GP, { foreignKey: 'id_gp' });
GP.hasMany(Results, { foreignKey: 'id_gp' });

Results.belongsTo(Pilotes, { foreignKey: 'id_pilote_p10' });
Pilotes.hasMany(Results, { foreignKey: 'id_pilote_p10' });

export default Results;