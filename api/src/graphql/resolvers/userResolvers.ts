import User from '../../models/userModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MyContext } from '../../types/context';
import { requireAuth } from '../../utils/auth';

const userResolvers = {
  Query: {
    users: async () => {
      return await User.findAll({ attributes: { exclude: ['password'] } });
    },
    user: async (_: any, { id }: { id: string }) => {
      return await User.findByPk(id, { attributes: { exclude: ['password'] } });
    }
  },

  Mutation: {
    registerAUser: async (
      _: any,
      {
        email,
        firstname,
        lastname,
        password,
        role,
        id_avatar
      }: {
        email: string;
        firstname: string;
        lastname: string;
        password: string;
        role?: string;
        id_avatar?: string;
      }
    ) => {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('Cet email existe déjà.');
      }

      if (role && role === 'admin') {
        throw new Error('Vous ne pouvez pas créer un utilisateur avec le rôle admin');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        email,
        firstname,
        lastname,
        password: hashedPassword,
        role: role || 'user',
        id_avatar
      });

      const userObj = user.toJSON();
      delete userObj.password;
      return userObj;
    },

    loginAUser: async (
      _: any,
      { email, password }: { email: string; password: string }
    ) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new Error("Cet email n'existe pas.");
      }

      const validPassword = await bcrypt.compare(password, user.getDataValue('password'));
      if (!validPassword) {
        throw new Error("Email ou mot de passe incorrect.");
      }

      const userData = {
        id_user: user.getDataValue('id_user'),
        email: user.getDataValue('email'),
        role: user.getDataValue('role'),
      };

      const token = jwt.sign(userData, process.env.JWT_KEY as string, { expiresIn: '30d' });

      return {token};
    },

    updateUser: async (
      _: any,
      {
        firstname,
        lastname,
        password,
        id_avatar,
        role
      }: {
        firstname: string;
        lastname: string;
        password: string;
        id_avatar?: string;
        role?: string;
      },
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
    
      const hashedPassword = await bcrypt.hash(password, 10);
    
      await existingUser.update({
        firstname,
        lastname,
        password: hashedPassword,
        id_avatar,
        role
      });
    
      return "Utilisateur mis à jour avec succès.";
    },
    
    deleteUser: async (_: any, __: any, context: MyContext) => {
      const user = requireAuth(context);
      const userId = user.id_user;

      const deleted = await User.destroy({ where: { id_user: userId } });
    
      if (!deleted) {
        throw new Error("Utilisateur non trouvé.");
      }
    
      return "Utilisateur supprimé avec succès.";
    }    
  }
};

export default userResolvers;
