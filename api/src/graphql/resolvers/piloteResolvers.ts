import Pilote from '../../models/piloteModel';

const piloteResolvers = {
  Query: {
    pilotes: async () => {
      return await Pilote.findAll();
    },
    pilote: async (_: any, { id_api_pilotes }: { id_api_pilotes: string }) => {
      return await Pilote.findByPk(id_api_pilotes);
    }
  },

  Mutation: {
    registerAPilote: async (
      _: any,
      {
        id_api_pilotes,
        name,
        picture,
        name_acronym,
      }: {
        id_api_pilotes: number;
        name: string;
        picture: string;
        name_acronym: string;
      }
    ) => {
      const existingPilote = await Pilote.findOne({ where: { id_api_pilotes } });
      if (existingPilote) {
        throw new Error('Cet pilote existe déjà.');
      }

      const pilote = await Pilote.create({
        id_api_pilotes,
        name,
        picture,
        name_acronym,
      });

      const userObj = pilote.toJSON();
      return userObj;
    },

    /*updateUser: async (
      _: any,
      {
        firstname,
        lastname,
        password,
        id_avatar,
        role
      }: {
        firstname: string;
        lastname: string;
        password: string;
        id_avatar?: string;
        role?: string;
      },
      context: MyContext
    ) => {
      const user = requireAuth(context);
      const userId = user.id_user;
    
      if (!userId) {
        throw new Error("Utilisateur non authentifié.");
      }
    
      const existingUser = await User.findByPk(userId);
      if (!existingUser) {
        throw new Error("Utilisateur non trouvé.");
      }
    
      const hashedPassword = await bcrypt.hash(password, 10);
    
      await existingUser.update({
        firstname,
        lastname,
        password: hashedPassword,
        id_avatar,
        role
      });
    
      return "Utilisateur mis à jour avec succès.";
    },
    
    deleteUser: async (_: any, __: any, context: MyContext) => {
      const user = requireAuth(context);
      const userId = user.id_user;

      const deleted = await User.destroy({ where: { id_user: userId } });
    
      if (!deleted) {
        throw new Error("Utilisateur non trouvé.");
      }
    
      return "Utilisateur supprimé avec succès.";
    }*/    
  }
};

export default piloteResolvers;