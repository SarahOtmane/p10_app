import User from '../../models/User.model';
import bcrypt from 'bcrypt';

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
    createUser: async (_: any, { email, firstname, lastname, password, role, id_avatar }: 
      { email: string; firstname: string; lastname: string; password: string; role?: string; id_avatar?: string }) => {

      // Hash du mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        email,
        firstname,
        lastname,
        password: hashedPassword,
        role: role || 'user',
        id_avatar
      });

      return { ...user.toJSON(), password: "******" }; // Ne jamais renvoyer le password en clair
    }
  }
};

export default userResolvers;
