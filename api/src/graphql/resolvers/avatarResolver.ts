import Avatar from '../../models/avatarModel';
import User from '../../models/userModel';
import { MyContext } from '../../types/context';
import { IResolvers } from '@graphql-tools/utils';
import fs from 'fs-extra';
import path from 'path';

const avatarResolvers: IResolvers = {
  Query: {
    getAllAvatars: async () => {
      try {
        return await Avatar.findAll();
      } catch (error) {
        throw new Error("Erreur lors du traitement des données.");
      }
    },
  },

  Mutation: {
    addAvatar: async (
      _: any,
      { filename, base64Image }: { filename: string; base64Image: string },
      context: MyContext
    ) => {
      try {
        const imageBuffer = Buffer.from(
          base64Image.replace(/^data:image\/\w+;base64,/, ''),
          'base64'
        );
    
        const uploadDir = path.join(__dirname, '../../public/images');
    
        // Créer le dossier si nécessaire
        await fs.ensureDir(uploadDir);
    
        const imagePath = path.join(uploadDir, filename);
    
        // Sauvegarder l'image physiquement
        await fs.writeFile(imagePath, imageBuffer);
    
        // Enregistrer dans la BDD
        await Avatar.create({ picture_avatar: filename });
    
        return "Avatar ajouté avec succès";
      } catch (error) {
        console.error("Erreur lors de l'ajout de l'avatar :", error);
        throw new Error("Erreur lors du traitement des données");
      }
    },    

    updateAvatar: async (
      _: any,
      { id_avatar, picture_avatar }: { id_avatar: number; picture_avatar: string },
      context: MyContext
    ) => {
      // const user = context.req.user;
      // if (!user || user.role !== 'admin') {
      //   throw new Error("Accès interdit : administrateur requis");
      // }

      try {
        const existing = await Avatar.findByPk(id_avatar);
        if (!existing) throw new Error("L'avatar spécifié n'existe pas.");

        await Avatar.update({ picture_avatar }, { where: { id_avatar } });
        return "Avatar modifié";
      } catch (error) {
        throw new Error("Erreur lors du traitement des données.");
      }
    },

    deleteAvatar: async (
      _: any,
      { id_avatar }: { id_avatar: number },
      context: MyContext
    ) => {
      // const user = context.req.user;
      // if (!user || user.role !== 'admin') {
      //   throw new Error("Accès interdit : administrateur requis");
      // }

      try {
        const existing = await Avatar.findByPk(id_avatar);
        if (!existing) throw new Error("L'avatar spécifié n'existe pas.");

        await Avatar.destroy({ where: { id_avatar } });
        return "Avatar supprimé.";
      } catch (error) {
        throw new Error("Erreur lors du traitement des données.");
      }
    },

    replaceUserAvatar: async (
      _: any,
      { id_avatar }: { id_avatar: number },
      context: MyContext
    ) => {
      const userId = context.req.user?.id_user;
      if (!userId) throw new Error("Utilisateur non authentifié.");

      try {
        const existing = await Avatar.findByPk(id_avatar);
        if (!existing) throw new Error("L'avatar spécifié n'existe pas.");

        await User.update({ id_avatar }, { where: { id_user: userId } });
        return "Avatar remplacé.";
      } catch (error) {
        throw new Error("Erreur lors du traitement des données.");
      }
    },
  },
};

export default avatarResolvers;