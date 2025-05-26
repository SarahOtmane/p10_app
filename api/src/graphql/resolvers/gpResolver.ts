import fetch from 'node-fetch';
import GP from '../../models/gpModel';
import Tracks from '../../models/trackModel';
import { MyContext } from '../../types/context';
import { requireAdmin, requireAuth } from '../../utils/auth';
import { User } from '../../models';

const gpResolvers = {
  Query: {
    getAllGPs: async () => await GP.findAll(),

    getGPById: async (_: any, { id_api_races }: { id_api_races: number }) => {
        const gp = await GP.findByPk(id_api_races);
        if (!gp) throw new Error("GP introuvable.");
        return gp;
    }
  },

  Mutation: {
    importGPsAndTracks: async (_: any, { year }: { year: string }, context: MyContext) => {
        // Vérification d'autorisation
        const user = requireAdmin(context);
        const userId = user.id_user;

        if (!userId) {
            throw new Error("Utilisateur non authentifié.");
        }
        
        const existingUser = await User.findByPk(userId);
        if (!existingUser) {
          throw new Error("Utilisateur non trouvé.");
        }

        try {
            const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}.json`);
            const data = await res.json();
            const races = data.MRData.RaceTable.Races;

            let insertedGPs = 0;
            let insertedTracks = 0;

            for (const race of races) {
                const circuit = race.Circuit;
                const location = circuit.Location;
                
                let existingTrack = await Tracks.findOne({
                    where: {
                        country_name: location.country,
                        track_name: circuit.circuitName
                    }
                });
              
                if (!existingTrack) {
                    existingTrack = await Tracks.create({
                        id_api_races: parseInt(race.round),
                        country_name: location.country,
                        track_name: circuit.circuitName,
                        picture_country: "",
                        picture_track: ""
                    });
                    insertedTracks++;
                }
              
                const existingGP = await GP.findByPk(parseInt(race.round));
                if (existingGP) continue;
              
                await GP.create({
                    id_api_races: parseInt(race.round),
                    season: race.season,
                    date: race.date,
                    time: race.time.replace("Z", ""),
                    id_api_track: existingTrack.getDataValue('id_api_races')
                });
              
                insertedGPs++;
            }

            return `${insertedGPs} GPs et ${insertedTracks} tracks importés pour la saison ${year}.`;
        } catch (err) {
          console.error("Erreur d'import GP/Tracks :", err);
          throw new Error("Échec de l'importation depuis l'API.");
        }
    },
    updateGP: async (_: any, { input }: any, context: MyContext) => {
        // Vérifie que l'utilisateur est un admin
        const user = requireAdmin(context);
        const userId = user.id_user;

        if (!userId) {
            throw new Error("Utilisateur non authentifié.");
        }
        
        const existingUser = await User.findByPk(userId);
        if (!existingUser) {
          throw new Error("Utilisateur non trouvé.");
        }
    
        const { id_api_races, ...updates } = input;
    
        // Récupérer le GP
        const gp = await GP.findByPk(id_api_races);
        if (!gp) {
            throw new Error("Grand Prix introuvable.");
        }
    
        // Mettre à jour avec les champs fournis
        try {
            await gp.update(updates);
            return gp;
        } catch (error) {
            console.error("Erreur lors de la mise à jour du GP :", error);
            throw new Error("Échec de la mise à jour du Grand Prix.");
        }
    }       

  }
};

export default gpResolvers;
