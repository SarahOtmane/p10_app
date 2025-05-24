import fetch from 'node-fetch';
import Pilote from '../../models/piloteModel';
import Ecurie from '../../models/ecurieModel';
import PiloteEcurie from '../../models/pilote_ecurieModel';
import GpPilote from '../../models/gp_pilotesModel';
import { User } from '../../models';
import { requireAdmin } from '../../utils/auth';
import { IResolvers } from '@graphql-tools/utils';

const piloteResolvers: IResolvers = {
    Mutation: {
        importDriversFromOpenF1: async (_: any, { gpId }: { gpId?: number }, context: any) => {
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
                const res = await fetch('https://api.openf1.org/v1/drivers?session_key=latest');
                const data = await res.json();
                const uniqueDrivers = new Map();

                data.forEach(driver => {
                    const key = `${driver.first_name}-${driver.last_name}`;
                    if (!uniqueDrivers.has(key)) {
                        uniqueDrivers.set(key, driver);
                    }
                });

                const year = new Date().getFullYear();

                for (const driver of uniqueDrivers.values()) {
                    const [ecurie] = await Ecurie.findOrCreate({
                        where: { nom: driver.team_name },
                        defaults: {
                            nom: driver.team_name,
                            couleur: driver.team_colour || null,
                            logo: null
                        }
                    });

                    const [pilote] = await Pilote.findOrCreate({
                        where: { name_acronym: driver.full_name },
                        defaults: {
                            name: driver.last_name,
                            first_name: driver.first_name,
                            picture: driver.headshot_url || null,
                            name_acronym: driver.full_name,
                        }
                    });

                    await PiloteEcurie.findOrCreate({
                        where: {
                            id_pilote: pilote.getDataValue('id_api_pilotes'),
                            id_ecurie: ecurie.getDataValue('id_api_ecurie'),
                            year: year
                        }
                    });

                    if (gpId) {
                        await GpPilote.findOrCreate({
                            where: {
                                id_gp: gpId,
                                id_pilote: pilote.getDataValue('id_api_pilotes'),
                                id_ecurie: ecurie.getDataValue('id_api_ecurie'),
                            }
                        });
                    }
                }

                return "Importation des pilotes terminée.";
            } catch (err) {
                console.error("Erreur lors de l'importation :", err);
                throw new Error("Une erreur est survenue pendant l'importation.");
            }
        }
    }
}

export default piloteResolvers;