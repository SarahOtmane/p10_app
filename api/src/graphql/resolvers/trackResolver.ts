import Tracks from '../../models/trackModel';

const trackResolvers = {
  Query: {
    // Récupérer tous les circuits
    getAllTracks: async () => {
      try {
        return await Tracks.findAll();
      } catch (error) {
        console.error('Erreur lors de la récupération des circuits :', error);
        throw new Error('Impossible de récupérer les circuits.');
      }
    },

    // Récupérer un circuit par son ID (id_api_races)
    getTrackById: async (_: any, { id_api_races }: { id_api_races: number }) => {
      try {
        const track = await Tracks.findByPk(id_api_races);
        if (!track) throw new Error('Circuit introuvable.');
        return track;
      } catch (error) {
        console.error('Erreur lors de la récupération du circuit :', error);
        throw new Error('Impossible de récupérer le circuit.');
      }
    }
  }
};

export default trackResolvers;
