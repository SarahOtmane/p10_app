import { GraphQLResolveInfo } from 'graphql';
import { MyContext } from '../../types/context';
import Result from '../../models/resultModel';
import { requireAuth } from '../../utils/auth';
import User from '../../models/userModel';
import GP from '../../models/gpModel';

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
  }
};

export default resultResolvers;
