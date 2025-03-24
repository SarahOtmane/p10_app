import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const PilotesEcurie = sequelize.define('PilotesEcurie', {
    id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  id_pilote: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_ecurie: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'pilotes_ecuries',
  timestamps: true,
  createdAt: true,
  updatedAt: true
});

import Pilotes from './piloteModel';
import Ecurie from './ecurieModel';

PilotesEcurie.belongsTo(Pilotes, { foreignKey: 'id_pilote' });
Pilotes.hasMany(PilotesEcurie, { foreignKey: 'id_pilote' });

PilotesEcurie.belongsTo(Ecurie, { foreignKey: 'id_ecurie' });
Ecurie.hasMany(PilotesEcurie, { foreignKey: 'id_ecurie' });

export default PilotesEcurie;