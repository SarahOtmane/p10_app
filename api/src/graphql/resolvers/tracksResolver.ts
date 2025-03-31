import Track from '../../models/trackModel';

const trackResolvers = {
  Query: {
    tracks: async () => {
      return await Track.findAll();
    },
    track: async (_: any, { id_api_races }: { id_api_races: string }) => {
      return await Track.findByPk(id_api_races);
    }
  },

  Mutation: {
    createATrack: async (
      _: any,
      {
        id_api_races,
        country_name,
        track_name,
        picture_country,
        picture_track,
      }: {
        id_api_races: number;
        country_name: string;
        track_name: string;
        picture_country: string;
        picture_track: string;
      }
    ) => {
      const existingTrack = await Track.findOne({ where: { id_api_races } });
      if (existingTrack) {
        throw new Error('Ce circuit existe déjà.');
      }

      const track = await Track.create({
        id_api_races,
        country_name,
        track_name,
        picture_country,
        picture_track,
      });

      const userObj = track.toJSON();
      return userObj;
    },
  }
};

export default trackResolvers;