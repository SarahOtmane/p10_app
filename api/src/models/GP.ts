import { DataTypes, Model } from 'sequelize';
import {sequelize} from '../config/database';

class GP extends Model {
  public id_api_races!: number;
  public season!: string;
  public date!: Date;
  public time!: Date;
  public id_api_tracks!: number;
}

GP.init(
  {
    id_api_races: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    season: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    id_api_tracks: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'gp',
    timestamps: false,
  }
);

export default GP;
