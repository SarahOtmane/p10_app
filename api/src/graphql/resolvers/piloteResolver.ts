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
    }
  }
};

export default piloteResolvers;