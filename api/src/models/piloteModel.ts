import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const Pilotes = sequelize.define('Pilotes', {
  id_api_pilotes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  picture: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name_acronym: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'pilotes',
  timestamps: true,
  createdAt: true,
  updatedAt: true
});

export default Pilotes;