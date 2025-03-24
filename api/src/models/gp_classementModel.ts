import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const GP_Classement = sequelize.define('GP_Classement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
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

import GP from './gpModel';
import GP_Pilotes from './gp_pilotesModel';

GP_Classement.belongsTo(GP, { foreignKey: 'id_gp' });
GP.hasMany(GP_Classement, { foreignKey: 'id_gp' });

GP_Classement.belongsTo(GP_Pilotes, { foreignKey: 'id_gp_pilote' });
GP_Pilotes.hasMany(GP_Classement, { foreignKey: 'id_gp_pilote' });

export default GP_Classement;