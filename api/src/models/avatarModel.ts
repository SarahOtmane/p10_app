import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import fs from 'fs-extra';

const Avatar = sequelize.define('Avatar', {
  id_avatar: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  }
}, {
  tableName: 'avatars',
  timestamps: true,
  createdAt: true,
  updatedAt: true
});

const directoryPath = './public/images';

async function synchroAvatar() {
  try {
    const files = fs.readdirSync(directoryPath);

    for (const file of files) {
      if (file.match(/\.(jpg|jpeg|png)$/)) {
        await Avatar.create({
          picture_avatar: file
        });
      }
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout des images à la table Avatar :", error);
  }
}

export default Avatar;