import fetch from 'node-fetch';
import GP from '../../models/gpModel';
import Pilote from '../../models/piloteModel';
import Ecurie from '../../models/ecurieModel';
import GP_Pilotes from '../../models/gp_pilotesModel';
import GP_Classement from '../../models/gp_classementModel';
import { IResolvers } from '@graphql-tools/utils';
import { MyContext } from '../../types/context';
import { requireAuth } from '../../utils/auth';
import { User } from '../../models';

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
          
            for (const { date } of datesData) {
                const classementRes = await fetch(`https://f1-api.demo.mds-paris.yt/api/gp/date/${date}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
              
                const classement = await classementRes.json();
              
                const gpDate = new Date(date);
                gpDate.setDate(gpDate.getDate() - 1);
                const formattedGpDate = gpDate.toISOString().split('T')[0];
              
                const gp = await GP.findOne({ where: { date: formattedGpDate } });
                if (!gp) continue;
              
                for (const entry of classement) {
                    const pilote = await Pilote.findOne({ where: { name: entry.driver } });
                    const ecurie = await Ecurie.findOne({ where: { name: entry.team } });
                    if (!pilote || !ecurie) continue;

                    const [gpPilote] = await GP_Pilotes.findOrCreate({
                        where: {
                            id_gp: gp.getDataValue('id_api_races'),
                            id_pilote: pilote.getDataValue('id_api_pilotes'),
                            id_ecurie: ecurie.getDataValue('id_api_ecurie')
                        }
                    });
                  
                    await GP_Classement.create({
                        position: isNaN(parseInt(entry.position)) ? null : parseInt(entry.position),
                        id_gp_pilote: gpPilote.getDataValue('id_gp_pilote')
                    });
                }
            }
          
            return 'Importation du classement GP terminée';
        } catch (error) {
            console.error('Erreur lors de l’importation du classement GP :', error);
            throw new Error('Erreur lors de l’importation du classement GP');
        }
    }
  }
};

export default gpClassementResolvers;