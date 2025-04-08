import Ecurie from '../../models/ecurieModel';

const ecurieResolvers = {
  Query: {
    ecuries: async () => {
      return await Ecurie.findAll();
    },
    ecurie: async (_: any, { id_api_ecurie }: { id_api_ecurie: number }) => {
      return await Ecurie.findByPk(id_api_ecurie);
    }
  },

  Mutation: {
    createAnEcurie: async (
      _: any,
      {
        id_api_ecurie,
        name,
        logo,
        color,
      }: {
        id_api_ecurie: number;
        name: string;
        logo: string;
        color: string;
      }
    ) => {
      const existingEcurie = await Ecurie.findOne({ where: { id_api_ecurie } });
      if (existingEcurie) {
        throw new Error('Ce circuit existe déjà.');
      }

      const ecurie = await Ecurie.create({
        id_api_ecurie,
        name,
        logo,
        color,
      });

      const userObj = ecurie.toJSON();
      return userObj;
    },
  }
};

export default ecurieResolvers;