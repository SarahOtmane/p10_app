import { IResolvers } from '@graphql-tools/utils';
import Ecurie from '../../models/ecurieModel';
import { MyContext } from '../../types/context';
import { User } from '../../models';
import { requireAuth } from '../../utils/auth';

const ecurieResolvers: IResolvers = {
    Query: {
        getEcuries: async () => {
            return await Ecurie.findAll();
        },
        getEcurie: async (_: any, { id_api_ecurie }: { id_api_ecurie: number }) => {
            return await Ecurie.findByPk(id_api_ecurie);
        }
    },

    Mutation: {
        updateEcurie: async (_: any, { input }: any, context: MyContext) => {
            const user = requireAuth(context);
            const userId = user.id_user;
            if (!userId) {
                throw new Error("Utilisateur non authentifié.");
            }
          
            const existingUser = await User.findByPk(userId);
            if (!existingUser) {
                throw new Error("Utilisateur non trouvé.");
            }
            const { id_api_ecurie, ...updates } = input;
          
            const ecurie = await Ecurie.findByPk(id_api_ecurie);
            if (!ecurie) {
                throw new Error("Écurie non trouvée.");
            }
          
            await ecurie.update(updates);
            return ecurie;
        }
    }
};

export default ecurieResolvers;
