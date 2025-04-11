
import { IResolvers } from '@graphql-tools/utils';
import League from '../../models/leagueModel';
import { requireAdmin, requireAuth } from '../../utils/auth';
import UserLeague from '../../models/user_leagueModel';
import User from '../../models/userModel';
import { MyContext } from '../../types/context';

const generateUniqueSharedLink = async (): Promise<string> => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const linkLength = 7;

    const generateRandomString = (): string => {
        let result = '';
        for (let i = 0; i < linkLength; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };

    let uniqueLink: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 100;

    do {
        uniqueLink = generateRandomString();
        const existingLeague = await League.findOne({ where: { shared_link: uniqueLink } });
        if (!existingLeague) {
            isUnique = true;
        }
        attempts++;
        if (attempts >= maxAttempts) {
            throw new Error("Impossible de générer un lien unique après plusieurs tentatives.");
        }
    } while (!isUnique);

    return uniqueLink;
};

const leagueResolvers: IResolvers = {

    query : {
        getLeague : async(
            _: any,
            { id_league }: { id_league: number },
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

            const league = await League.findByPk(id_league);
            if (!league) throw new Error("La league spécifiée n'existe pas.");

            const userLeague = await UserLeague.findOne({
                where: { id_user: userId, id_league },
            });
    
            if (!userLeague) {
                throw new Error("Vous ne faites pas partie de cette league.");
            }

            return league;
        },
    },

    Mutation: {
        createLeague: async (
            _: any,
            { name, isPrivate }: { name: string; isPrivate: boolean;  },
            context: MyContext
        ) => {
            try {
                const user = requireAuth(context);
                const userId = user.id_user;

                if (!userId) {
                  throw new Error("Utilisateur non authentifié.");
                }
            
                const existingUser = await User.findByPk(userId);
                if (!existingUser) {
                  throw new Error("Utilisateur non trouvé.");
                }

                const newLeague = await League.create({
                    name,
                    private : isPrivate,
                    active : true,
                    shared_link: await generateUniqueSharedLink(),
                });

                await UserLeague.create({
                    role: 'admin',
                    id_user: userId,
                    id_league: newLeague.getDataValue('id_league'),
                })

                return newLeague.getDataValue('shared_link');
            } catch (error) {
                console.error("Error creating league:", error);
                throw new Error("Error creating league");
            }
        },

        updateLeague: async(
            _: any,
            {id_league, isPrivate, active }: { id_league: number, isPrivate: boolean; active: boolean },
            context: MyContext
        ) => {
            try {
                const user = requireAuth(context);
                const userId = user.id_user;

                if (!userId) {
                  throw new Error("Utilisateur non authentifié.");
                }
            
                const existingUser = await User.findByPk(userId);
                if (!existingUser) {
                  throw new Error("Utilisateur non trouvé.");
                }

                const existing = await League.findByPk(id_league);
                if (!existing) throw new Error("La league spécifiée n'existe pas.");

                const userLeague = await UserLeague.findOne({
                    where: { id_user: userId, id_league },
                });
        
                if (!userLeague || userLeague.getDataValue('role') !== 'admin') {
                    throw new Error("Vous n'avez pas les droits nécessaires pour modifier cette ligue.");
                }
                
                await League.update({ isPrivate, active }, { where: { id_league } });

                return "League modifiée";
            } catch (error) {
                console.error("Error updating league:", error);
                throw new Error("Error updating league");
            }
        },

        deleteLeague: async (
            _: any,
            { id_league }: { id_league: number },
            context
        ) => {
            try {
                const user = requireAuth(context);
                const userId = user.id_user;

                if (!userId) {
                  throw new Error("Utilisateur non authentifié.");
                }
            
                const existingUser = await User.findByPk(userId);
                if (!existingUser) {
                  throw new Error("Utilisateur non trouvé.");
                }

                const existing = await League.findByPk(id_league);
                if (!existing) throw new Error("La league spécifiée n'existe pas.");

                const userLeague = await UserLeague.findOne({
                    where: { id_user: userId, id_league },
                });
        
                if (!userLeague || userLeague.getDataValue('role') !== 'admin') {
                    throw new Error("Vous n'avez pas les droits nécessaires pour modifier cette ligue.");
                }
      
                await League.destroy({ where: { id_league } });
                return "League supprimé.";
            } catch (error) {
                console.error("Error deleting league:", error);
                throw new Error("Error deleating league");
            }
        },
    }
}

export default leagueResolvers;