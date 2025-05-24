import fetch from 'node-fetch';
import { Op, fn, col, where } from 'sequelize';

import GP from '../../models/gpModel';
import Pilote from '../../models/piloteModel';
import Ecurie from '../../models/ecurieModel';
import GP_Pilotes from '../../models/gp_pilotesModel';
import GP_Classement from '../../models/gp_classementModel';
import { IResolvers } from '@graphql-tools/utils';
import { MyContext } from '../../types/context';
import { requireAuth } from '../../utils/auth';
import { PilotesEcurie, User } from '../../models';

const gpClassementResolvers: IResolvers = {
  Mutation: {
    implementOldGpClassement: async (
        _: any,
        __: any,
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

        try {
            const token = '2025';
            const datesRes = await fetch('https://f1-api.demo.mds-paris.yt/api/gp/dates', {
                headers: { Authorization: `Bearer ${token}` }
            });
          
            const datesData = await datesRes.json();

            if (!Array.isArray(datesData)) throw new Error("Données de dates invalides");
          
            for (const { date } of datesData) {
                const classementRes = await fetch(`https://f1-api.demo.mds-paris.yt/api/gp/date?date=${date}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
              
                const classement = await classementRes.json();

                if (classement.error) {
                    throw new Error(classement.error);
                }
              
                const gpDate = new Date(date);
                gpDate.setDate(gpDate.getDate() - 1);
                const formattedGpDate = gpDate.toISOString().split('T')[0];
              
                const gp = await GP.findOne({ where: { date: formattedGpDate } });
                if (!gp) {
                    throw new Error("GP introuvable pour la date spécifiée");
                }
              
                for (const entry of classement) {
                    if (entry.driver ==='Carlos Sainz Jnr') entry.driver = 'Carlos Sainz';
                    
                    let pilote = await Pilote.findOne({
                      where: where(fn('LOWER', col('name')), entry.driver.toLowerCase())
                    });

                    const ecurie = await Ecurie.findOne({
                      where: where(fn('LOWER', col('short_name')), entry.team.toLowerCase())
                    });

                    if (!pilote) {
                        console.log(`Création du pilote : ${entry.driver}`);
                        pilote = await Pilote.create({
                          name: entry.driver,
                        });
                    } 

                    if (!ecurie) {
                        throw new Error("Écurie introuvable pour l'entrée : " + entry.team);
                    }

                    await PilotesEcurie.findOrCreate({
                        where: {
                          id_pilote: pilote.getDataValue('id_api_pilotes'),
                          id_ecurie: ecurie.getDataValue('id_api_ecurie'),
                          year: new Date().getFullYear()
                        }
                    });

                    const [gpPilote] = await GP_Pilotes.findOrCreate({
                        where: {
                            id_gp: gp.getDataValue('id_api_races'),
                            id_pilote: pilote.getDataValue('id_api_pilotes'),
                            id_ecurie: ecurie.getDataValue('id_api_ecurie')
                        }
                    });

                    if(entry.position==='not classified' || entry.position==="NC") entry.position = -1;
                  
                    await GP_Classement.findOrCreate({
                        where: {
                            id_gp_pilote: gpPilote.getDataValue('id'),
                        },
                        defaults: {
                            position: entry.position,
                        },
                    });
                }
            }
          
            return 'Importation du classement GP terminée';
        } catch (error) {
            console.error('Erreur lors de l’importation du classement GP :', error);
            throw new Error('Erreur lors de l’importation du classement GP');
        }
    },

    implementLatestGpClassement: async (
      _: any,
      __: any,
      context: MyContext
    ) => {
      const user = requireAuth(context);
      const userId = user.id_user;
      if (!userId) throw new Error("Utilisateur non authentifié.");

      const existingUser = await User.findByPk(userId);
      if (!existingUser) throw new Error("Utilisateur non trouvé.");

      try {
        const token = '2025';
        const classementRes = await fetch('https://f1-api.demo.mds-paris.yt/api/gp/latest', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const classement = await classementRes.json();

        if (!Array.isArray(classement)) throw new Error("Format de classement invalide.");

        // Extraire la date du premier item
        const scrapedAt = classement[0]?.scraped_at;
        if (!scrapedAt) throw new Error("Date introuvable dans les résultats du dernier GP.");

        const gpDate = new Date(scrapedAt);
        const formattedGpDate = gpDate.toISOString().split('T')[0];

        const gp = await GP.findOne({ where: { date: formattedGpDate } });
        if (!gp) throw new Error("GP introuvable pour la date : " + formattedGpDate);

        for (const entry of classement) {
          if (entry.driver === 'Carlos Sainz Jnr') entry.driver = 'Carlos Sainz';

          let pilote = await Pilote.findOne({
            where: where(fn('LOWER', col('name')), entry.driver.toLowerCase())
          });

          if (!pilote) {
            pilote = await Pilote.create({
              name: entry.driver,
              number: entry.number
            });
          }

          let ecurie = await Ecurie.findOne({
            where: where(fn('LOWER', col('short_name')), entry.team.toLowerCase())
          });

          if (!ecurie) {
            ecurie = await Ecurie.create({
              short_name: entry.team,
              name: entry.team
            });
          }

          await PilotesEcurie.findOrCreate({
            where: {
              id_pilote: pilote.getDataValue('id_api_pilotes'),
              id_ecurie: ecurie.getDataValue('id_api_ecurie'),
              year: new Date().getFullYear()
            }
          });

          const [gpPilote] = await GP_Pilotes.findOrCreate({
            where: {
              id_gp: gp.getDataValue('id_api_races'),
              id_pilote: pilote.getDataValue('id_api_pilotes'),
              id_ecurie: ecurie.getDataValue('id_api_ecurie')
            }
          });

          let position = parseInt(entry.position, 10);
          if (isNaN(position)) position = -1;

          await GP_Classement.findOrCreate({
            where: {
              id_gp_pilote: gpPilote.getDataValue('id'),
            },
            defaults: {
              position,
            },
          });
        }

        return 'Classement du dernier GP importé avec succès.';
      } catch (error) {
        console.error('Erreur lors de l’importation du classement du dernier GP :', error);
        throw new Error('Erreur lors de l’importation du classement du dernier GP');
      }
    }
  }
};

export default gpClassementResolvers;