import GP from '../../models/GP';

const gpResolvers = {
  Query: {
    gps: async () => {
      return await GP.findAll();
    },
    gp: async (_: any, { id_api_races }: { id_api_races: number }) => {
      return await GP.findByPk(id_api_races);
    },
  },
  Mutation: {
    createGP: async (_: any, { season, date, time, id_api_tracks }: 
      { season: string; date: string; time: string; id_api_tracks: number }) => {
      return await GP.create({ season, date, time, id_api_tracks });
    },
    updateGP: async (_: any, { id_api_races, season, date, time, id_api_tracks }: 
      { id_api_races: number; season?: string; date?: string; time?: string; id_api_tracks?: number }) => {
      const gp = await GP.findByPk(id_api_races);
      if (!gp) throw new Error('GP not found');
      
      await gp.update({ season, date, time, id_api_tracks });
      return gp;
    },
    deleteGP: async (_: any, { id_api_races }: { id_api_races: number }) => {
      const gp = await GP.findByPk(id_api_races);
      if (!gp) throw new Error('GP not found');
      
      await gp.destroy();
      return 'GP deleted successfully';
    },
  },
};

export default gpResolvers;
