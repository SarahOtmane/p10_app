import { GraphQLResolveInfo } from 'graphql';
import { MyContext } from '../../types/context';
import Result from '../../models/resultModel';
import { Op } from 'sequelize';
import { requireAuth } from '../../utils/auth';
import User from '../../models/userModel';
import GP from '../../models/gpModel';
import { GP_Classement, GP_Pilotes } from '../../models';
import gpClassementResolvers, { implementLatestGpClassement } from './gpClassementResolver';

const POINTS_BY_POSITION: Record<number, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 6,
  5: 8,
  6: 10,
  7: 12,
  8: 15,
  9: 18,
  10: 25,
  11: 18,
  12: 15,
  13: 12,
  14: 10,
  15: 8,
  16: 6,
  17: 4,
  18: 2,
  19: 1,
  20: 1
};


const resultResolvers = {
  Query: {
    // Récupère tous les résultats du user connecté
    getAllResultsOfUser: async (_: any, __: any, context: MyContext) => {
      const user = requireAuth(context);
      const userId = user.id_user;

      return await Result.findAll({
        where: { id_user: userId },
        include: [
          { model: GP },
          { model: User, attributes: ['id', 'email'] }
        ]
      });
    },

    // Récupère un résultat précis par ID, uniquement s'il appartient à l'utilisateur connecté
    getResultOfUserById: async (_: any, { id }: { id: number }, context: MyContext) => {
      const user = requireAuth(context);
      const userId = user.id_user;

      const result = await Result.findOne({
        where: {
          id: id,
          id_user: userId
        },
        include: [
          { model: GP },
          { model: User, attributes: ['id', 'email'] }
        ]
      });

      if (!result) throw new Error("Résultat introuvable");
      return result;
    }
  },

  Mutation: {
    // Permet à l'utilisateur de placer un pari sur le pilote P10 pour le prochain GP
    // Vérifie que le pari est placé au moins 24h avant le début du GP
    // Si un pari existe déjà, il est mis à jour
    // Si aucun pari n'existe, un nouveau pari est créé
    placeBet: async (
      _: any,
      { id_pilote }: { id_pilote: number },
      context: MyContext
    ) => {
      const user = requireAuth(context);
      const userId = user.id_user;
      if (!userId) throw new Error("Utilisateur non authentifié.");

      try {
        const now = new Date();
        const formattedDate = now.toISOString().split('T')[0];

        // Récupération du GP à venir (le plus proche dans le futur)
        const nextGp = await GP.findOne({
          where: {
            date: { [Op.gt]: formattedDate }
          },
          order: [['date', 'ASC']]
        });
        if (!nextGp) throw new Error("Aucun GP à venir trouvé.");

        const gpDate = new Date(nextGp.getDataValue('date'));
        const timeDiffMs = gpDate.getTime() - now.getTime();
        const hoursDiff = timeDiffMs / (1000 * 60 * 60);

        if (hoursDiff < 24) {
          throw new Error("Les paris ne sont autorisés que jusqu'à 24h avant le début du GP.");
        }

        // Vérifie si un pari existe déjà
        const existingBet = await Result.findOne({
          where: {
            id_user: userId,
            id_gp: nextGp.getDataValue('id_api_races')
          }
        });

        if (existingBet) {
          // Mise à jour du pari existant
          await existingBet.update({ id_pilote_p10: id_pilote });
          return "Pari mis à jour avec succès.";
        } else {
          // Création d’un nouveau pari
          await Result.create({
            id_user: userId,
            id_gp: nextGp.getDataValue('id_api_races'),
            id_pilote_p10: id_pilote
          });
          return "Pari enregistré avec succès.";
        }
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du pari :", error);
        throw new Error("Impossible d'enregistrer le pari.");
      }
    },

    // Met à jour les résultats des paris P10 avec les points basés sur le classement du GP
    updateResultsWithPoints: async (_: any, __: any, context: MyContext) => {
      const user = requireAuth(context);
      if (!user.id_user) throw new Error("Utilisateur non authentifié");

      try {
        const now = new Date();

        // GP le plus récent dont la date est dépassée de +24h
        const gp = await GP.findOne({
          where: {
            date: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
          },
          order: [['date', 'DESC']]
        });

        if (!gp) throw new Error("Aucun GP terminé depuis plus de 24h.");

        const results = await Result.findAll({
          where: { id_gp: gp.getDataValue('id_api_races') },
        });

        // Si les points sont déjà calculés (au moins un enregistrement avec point_p10)
        const alreadyUpdated = results.some(r => r.getDataValue('point_p10') !== null);
        if (alreadyUpdated) {
          return "Les résultats ont déjà été mis à jour pour ce GP.";
        }

        // Vérifie si les classements existent
        const classements = await GP_Classement.findAll({
          include: [{ model: GP_Pilotes, where: { id_gp: gp.getDataValue('id_api_races') }, }]
        });

        if (!classements || classements.length === 0) {
          console.log("Aucun classement trouvé. Appel de implementLatestGpClassement...");
          if (
            gpClassementResolvers &&
            gpClassementResolvers.Mutation &&
            typeof implementLatestGpClassement === 'function'
          ) {
            await implementLatestGpClassement(_, __, context);
          } else {
            throw new Error("La fonction implementLatestGpClassement n’est pas disponible.");
          }
        }

        // Mise à jour des points des utilisateurs
        for (const result of results) {
          const gpPilote = await GP_Pilotes.findOne({
            where: {
              id_gp: gp.getDataValue('id_api_races'),
              id_pilote: result.getDataValue('id_pilote_p10'),
            }
          });

          if (!gpPilote) continue;

          const classement = await GP_Classement.findOne({
            where: { id_gp_pilote: gpPilote.getDataValue('id') }
          });

          if (!classement) continue;

          const position = classement.getDataValue('position');
          const points = POINTS_BY_POSITION[position] || 0;

          await result.update({ point_p10: points });
        }

        return "Points mis à jour pour les paris du dernier GP.";
      } catch (error) {
        console.error("Erreur dans updateResultsWithPoints :", error);
        throw new Error("Échec de la mise à jour des résultats.");
      }
    }
  }
};

export default resultResolvers;
