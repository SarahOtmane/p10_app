import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const GP_Pilotes = sequelize.define('GP_Pilotes', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
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

import GP from './gpModel';
import Pilotes from './piloteModel';
import Ecuries from './ecurieModel';

GP_Pilotes.belongsTo(GP, { foreignKey: 'id_gp' });
GP.hasMany(GP_Pilotes, { foreignKey: 'id_gp' });

GP_Pilotes.belongsTo(Pilotes, { foreignKey: 'id_pilote' });
Pilotes.hasMany(GP_Pilotes, { foreignKey: 'id_pilote' });

GP_Pilotes.belongsTo(Ecuries, { foreignKey: 'id_ecurie' });
Ecuries.hasMany(GP_Pilotes, { foreignKey: 'id_ecurie' });

export default GP_Pilotes;