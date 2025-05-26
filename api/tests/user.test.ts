import userResolvers from '../src/graphql/resolvers/userResolvers';
import User from '../src/models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { requireAuth, requireAdmin } from '../src/utils/auth';
import 'dotenv/config';
import { MyContext } from '../src/types/context';
import { Request, Response } from 'express';

// api/src/graphql/resolvers/userResolvers.test.ts

jest.mock('../src/models/userModel');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../src/utils/auth', () => ({
  requireAuth: jest.fn(),
  requireAdmin: jest.fn(),
}));

const mockUser = {
  id: 1,
  id_user: 1,
  email: 'test@example.com',
  firstname: 'Test',
  lastname: 'User',
  password: 'hashedpassword',
  role: 'user',
  id_avatar: null,
  toJSON: function () {
    return { ...this };
  },
  getDataValue: function (key: string) {
    return this[key];
  },
  update: jest.fn(),
};

const contextUser: MyContext = {
  req: {
    headers: {},
    body: {},
    query: {},
    params: {},
    method: 'GET',
    url: '/api/example',
    user: {
      id_user: 1,
      role: 'admin',
      email: 'admin@example.com',
    },
  } as unknown as Request & {
    user?: {
      id_user: 1,
      role: 'user',
      email: 'test@example.com',
    },
  },
  res: {} as Response,
};

const adminContext = {
  req: {
    user: {
      id_user: 1,
      role: 'admin',
      email: 'admin@example.com',
    },
  },
  res: {},
};

describe('userResolvers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Query', () => {
    describe('users', () => {
      it('should return all users', async () => {
        (requireAdmin as jest.Mock).mockReturnValue({ id_user: 1, role: 'admin' });
        (User.findByPk as jest.Mock).mockResolvedValue(mockUser); // <-- Ajoute ceci
        (User.findAll as jest.Mock).mockResolvedValue([mockUser]);
        const users = await userResolvers.Query.users({}, {}, contextUser);
        expect(User.findAll).toHaveBeenCalledWith({ attributes: { exclude: ['password'] } });
        expect(users).toEqual([mockUser]);
      });
    });

    describe('user', () => {
      it('should return a user by id', async () => {
        (requireAuth as jest.Mock).mockReturnValue({ id_user: 1, role: 'admin' });
        (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
        const user = await userResolvers.Query.user({}, null, contextUser);
        expect(User.findByPk).toHaveBeenNthCalledWith(1, 1); // Premier appel avec 1 (nombre)
        expect(User.findByPk).toHaveBeenNthCalledWith(2, 1, { attributes: { exclude: ['password'] } }); // Deuxième appel
        expect(user).toEqual(mockUser);
      });

      it('should throw error if user not found', async () => {
        (requireAuth as jest.Mock).mockReturnValue({ id_user: 1, role: 'admin' });
        (User.findByPk as jest.Mock).mockResolvedValue(null);
        await expect(userResolvers.Query.user({}, null, contextUser)).rejects.toThrow("Utilisateur non trouvé.");
      });
    });
  });

  describe('Mutation', () => {
    describe('registerAUser', () => {
      it('should register a new user', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(null);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
        (User.create as jest.Mock).mockResolvedValue(mockUser);

        const input = {
          email: 'test@example.com',
          firstname: 'Test',
          lastname: 'User',
          password: 'password',
          role: undefined,
          id_avatar: null,
        };

        const result = await userResolvers.Mutation.registerAUser(null, input);
        expect(User.findOne).toHaveBeenCalledWith({ where: { email: input.email } });
        expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
        expect(User.create).toHaveBeenCalledWith({
          ...input,
          password: 'hashedpassword',
          role: 'user',
        });
        expect(result.password).toBeUndefined();
        expect(result.email).toBe(input.email);
      });

      it('should throw error if email exists', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(mockUser);
        await expect(
          userResolvers.Mutation.registerAUser(null, {
            email: 'test@example.com',
            firstname: 'Test',
            lastname: 'User',
            password: 'password',
            role: undefined,
            id_avatar: null,
          })
        ).rejects.toThrow('Cet email existe déjà.');
      });

      it('should throw error if trying to create admin user', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(null);
        await expect(
          userResolvers.Mutation.registerAUser(null, {
            email: 'test@example.com',
            firstname: 'Test',
            lastname: 'User',
            password: 'password',
            role: 'admin',
            id_avatar: null,
          })
        ).rejects.toThrow('Vous ne pouvez pas créer un utilisateur avec le rôle admin');
      });
    });

    describe('loginAUser', () => {
      it('should login a user and return token', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (jwt.sign as jest.Mock).mockReturnValue('token');

        const result = await userResolvers.Mutation.loginAUser(null, {
          email: 'test@example.com',
          password: 'password',
        });

        expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
        expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedpassword');
        expect(jwt.sign).toHaveBeenCalled();
        expect(result).toBe('token');
      });

      it('should throw error if email does not exist', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(null);
        await expect(
          userResolvers.Mutation.loginAUser(null, {
            email: 'notfound@example.com',
            password: 'password',
          })
        ).rejects.toThrow("Cet email n'existe pas.");
      });

      it('should throw error if password is invalid', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await expect(
          userResolvers.Mutation.loginAUser(null, {
            email: 'test@example.com',
            password: 'wrongpassword',
          })
        ).rejects.toThrow('Email ou mot de passe incorrect.');
      });
    });

    describe('updateUser', () => {
      const context = { req: { headers: { authorization: 'Bearer token' } }, res: {} } as any;

      it('should update user successfully', async () => {
        (requireAuth as jest.Mock).mockReturnValue({ id_user: 1 });
        (User.findByPk as jest.Mock).mockResolvedValue({
          ...mockUser,
          update: jest.fn().mockResolvedValue(true),
        });
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

        const result = await userResolvers.Mutation.updateUser(
          null,
          {
            firstname: 'Updated',
            lastname: 'User',
            password: 'newpassword',
            id_avatar: null,
            role: 'user',
          },
          context
        );

        expect(requireAuth).toHaveBeenCalledWith(context);
        expect(User.findByPk).toHaveBeenCalledWith(1);
        expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
        expect(result).toBe('Utilisateur mis à jour avec succès.');
      });

      it('should throw error if user not authenticated', async () => {
        (requireAuth as jest.Mock).mockReturnValue({});
        await expect(
          userResolvers.Mutation.updateUser(
            null,
            {
              firstname: 'Updated',
              lastname: 'User',
              password: 'newpassword',
              id_avatar: null,
              role: 'user',
            },
            context
          )
        ).rejects.toThrow('Utilisateur non authentifié.');
      });

      it('should throw error if user not found', async () => {
        (requireAuth as jest.Mock).mockReturnValue({ id_user: 1 });
        (User.findByPk as jest.Mock).mockResolvedValue(null);

        await expect(
          userResolvers.Mutation.updateUser(
            null,
            {
              firstname: 'Updated',
              lastname: 'User',
              password: 'newpassword',
              id_avatar: null,
              role: 'user',
            },
            context
          )
        ).rejects.toThrow('Utilisateur non trouvé.');
      });
    });

    describe('deleteUser', () => {
      const context = { req: { headers: { authorization: 'Bearer token' } }, res: {} } as any;

      it('should delete user successfully', async () => {
        (requireAuth as jest.Mock).mockReturnValue({ id_user: 1 });
        (User.destroy as jest.Mock).mockResolvedValue(1);

        const result = await userResolvers.Mutation.deleteUser(null, null, context);
        expect(User.destroy).toHaveBeenCalledWith({ where: { id_user: 1 } });
        expect(result).toBe('Utilisateur supprimé avec succès.');
      });

      it('should throw error if user not found', async () => {
        (requireAuth as jest.Mock).mockReturnValue({ id_user: 1 });
        (User.destroy as jest.Mock).mockResolvedValue(0);

        await expect(
          userResolvers.Mutation.deleteUser(null, null, context)
        ).rejects.toThrow('Utilisateur non trouvé.');
      });
    });
  });
});