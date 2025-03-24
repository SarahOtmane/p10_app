import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

interface LeagueAttributes {
  id_league: string;
  name: string;
  private: boolean;
  shared_link?: string;
  active: boolean;
}

const League = sequelize.define<Model<LeagueAttributes>>('League', {
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
  shared_link: {
    type: DataTypes.STRING
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
}, {
  tableName: 'leagues',
  timestamps: true,
  createdAt: true,
  updatedAt: true
});

// Générer un shared_link avant de sauvegarder en base de données
const generateRandomLink = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let link = '';
  for (let i = 0; i < 6; i++) {
    link += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return link;
};

const generateUniqueLink = async () => {
  let uniqueLink = generateRandomLink(); // Générer un lien aléatoire
  if (typeof uniqueLink !== 'string') {
    throw new Error('Generated link is not a string');
  }
  let leagueWithSameLink = await League.findOne({ where: { shared_link: uniqueLink as string } });

  // Vérifier si le lien généré est déjà utilisé
  while (leagueWithSameLink) {
    uniqueLink = generateRandomLink();
    if (typeof uniqueLink !== 'string') {
      throw new Error('Generated link is not a string');
    }
    leagueWithSameLink = await League.findOne({ where: { shared_link: uniqueLink } });
  }

  return uniqueLink;
};

League.addHook('beforeSave', async (league: Model<LeagueAttributes>) => {
  try {
    if (!(league as any).shared_link) {
      (league as any).shared_link = await generateUniqueLink();
    }
  } catch (error) {
    throw new Error(error);
  }
});

export default League;