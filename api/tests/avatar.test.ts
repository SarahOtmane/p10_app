import avatarResolvers from '../src/graphql/resolvers/avatarResolver';
import Avatar from '../src/models/avatarModel';
import User from '../src/models/userModel';
import fs from 'fs-extra';

// api/src/graphql/resolvers/avatarResolver.test.ts

jest.mock('../src/models/avatarModel');
jest.mock('../src/models/userModel');
jest.mock('fs-extra');
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
}));
jest.mock('../src/utils/auth', () => ({
  requireAdmin: jest.fn(),
}));

const mockContext = {
  req: { user: { id_user: 42 } },
};

describe('avatarResolvers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Query', () => {
    describe('getAllAvatars', () => {
      it('should return all avatars', async () => {
        (Avatar.findAll as unknown as unknown as jest.Mock).mockResolvedValue([{ id_avatar: 1 }]);
        const result = await (avatarResolvers.Query as any).getAllAvatars();
        expect(Avatar.findAll).toHaveBeenCalled();
        expect(result).toEqual([{ id_avatar: 1 }]);
      });

      it('should throw error on DB error', async () => {
        (Avatar.findAll as unknown as unknown as jest.Mock).mockRejectedValue(new Error('DB error'));
        await expect((avatarResolvers.Query as any).getAllAvatars()).rejects.toThrow(
          "Erreur lors du traitement des données."
        );
      });
    });
  });

  describe('Mutation', () => {
    describe('addAvatar', () => {
      it('should add avatar successfully', async () => {
        (fs.ensureDir as unknown as unknown as jest.Mock).mockResolvedValue(undefined);
        (fs.writeFile as unknown as unknown as unknown as jest.Mock).mockResolvedValue(undefined);
        (Avatar.create as unknown as unknown as jest.Mock).mockResolvedValue({ picture_avatar: 'test.png' });

        const input = {
          filename: 'test.png',
          base64Image: 'data:image/png;base64,aGVsbG8=',
        };

        const result = await (avatarResolvers.Mutation as any).addAvatar(
          null,
          input,
          mockContext
        );
        expect(fs.ensureDir).toHaveBeenCalled();
        expect(fs.writeFile).toHaveBeenCalled();
        expect(Avatar.create).toHaveBeenCalledWith({ picture_avatar: 'test.png' });
        expect(result).toBe('Avatar ajouté avec succès');
      });

      it('should throw error on fs or DB error', async () => {
        (fs.ensureDir as unknown as unknown as jest.Mock).mockRejectedValue(new Error('FS error'));
        const input = {
          filename: 'test.png',
          base64Image: 'data:image/png;base64,aGVsbG8=',
        };
        await expect(
          (avatarResolvers.Mutation as any).addAvatar(null, input, mockContext)
        ).rejects.toThrow('Erreur lors du traitement des données');
      });
    });

    describe('updateAvatar', () => {
      it('should update avatar successfully', async () => {
        (Avatar.findByPk as unknown as unknown as jest.Mock).mockResolvedValue({ id_avatar: 1 });
        (Avatar.update as unknown as unknown as jest.Mock).mockResolvedValue([1]);

        const result = await (avatarResolvers.Mutation as any).updateAvatar(
          null,
          { id_avatar: 1, picture_avatar: 'new.png' },
          mockContext
        );
        expect(Avatar.findByPk).toHaveBeenCalledWith(1);
        expect(Avatar.update).toHaveBeenCalledWith(
          { picture_avatar: 'new.png' },
          { where: { id_avatar: 1 } }
        );
        expect(result).toBe('Avatar modifié');
      });

      it('should throw error if avatar does not exist', async () => {
        (Avatar.findByPk as unknown as unknown as jest.Mock).mockResolvedValue(null);
        await expect(
          (avatarResolvers.Mutation as any).updateAvatar(
            null,
            { id_avatar: 1, picture_avatar: 'new.png' },
            mockContext
          )
        ).rejects.toThrow("Erreur lors du traitement des données.");
      });

      it('should throw error on DB error', async () => {
        (Avatar.findByPk as unknown as unknown as jest.Mock).mockRejectedValue(new Error('DB error'));
        await expect(
          (avatarResolvers.Mutation as any).updateAvatar(
            null,
            { id_avatar: 1, picture_avatar: 'new.png' },
            mockContext
          )
        ).rejects.toThrow("Erreur lors du traitement des données.");
      });
    });

    describe('deleteAvatar', () => {
      it('should delete avatar successfully', async () => {
        (Avatar.findByPk as unknown as unknown as jest.Mock).mockResolvedValue({ id_avatar: 1 });
        (Avatar.destroy as unknown as unknown as jest.Mock).mockResolvedValue(1);

        const result = await (avatarResolvers.Mutation as any).deleteAvatar(
          null,
          { id_avatar: 1 },
          mockContext
        );
        expect(Avatar.findByPk).toHaveBeenCalledWith(1);
        expect(Avatar.destroy).toHaveBeenCalledWith({ where: { id_avatar: 1 } });
        expect(result).toBe('Avatar supprimé.');
      });

      it('should throw error if avatar does not exist', async () => {
        (Avatar.findByPk as unknown as unknown as jest.Mock).mockResolvedValue(null);
        await expect(
          (avatarResolvers.Mutation as any).deleteAvatar(
            null,
            { id_avatar: 1 },
            mockContext
          )
        ).rejects.toThrow("Erreur lors du traitement des données.");
      });

      it('should throw error on DB error', async () => {
        (Avatar.findByPk as unknown as unknown as jest.Mock).mockRejectedValue(new Error('DB error'));
        await expect(
          (avatarResolvers.Mutation as any).deleteAvatar(
            null,
            { id_avatar: 1 },
            mockContext
          )
        ).rejects.toThrow("Erreur lors du traitement des données.");
      });
    });

    describe('replaceUserAvatar', () => {
      it('should replace user avatar successfully', async () => {
        (Avatar.findByPk as unknown as unknown as jest.Mock).mockResolvedValue({ id_avatar: 2 });
        (User.update as unknown as unknown as jest.Mock).mockResolvedValue([1]);

        const result = await (avatarResolvers.Mutation as any).replaceUserAvatar(
          null,
          { id_avatar: 2 },
          mockContext
        );
        expect(Avatar.findByPk).toHaveBeenCalledWith(2);
        expect(User.update).toHaveBeenCalledWith(
          { id_avatar: 2 },
          { where: { id_user: 42 } }
        );
        expect(result).toBe('Avatar remplacé.');
      });

      it('should throw error if user not authenticated', async () => {
        const context = { req: {} };
        await expect(
          (avatarResolvers.Mutation as any).replaceUserAvatar(
            null,
            { id_avatar: 2 },
            context
          )
        ).rejects.toThrow('Utilisateur non authentifié.');
      });

      it('should throw error if avatar does not exist', async () => {
        (Avatar.findByPk as unknown as unknown as jest.Mock).mockResolvedValue(null);
        await expect(
          (avatarResolvers.Mutation as any).replaceUserAvatar(
            null,
            { id_avatar: 2 },
            mockContext
          )
        ).rejects.toThrow("Erreur lors du traitement des données.");
      });

      it('should throw error on DB error', async () => {
        (Avatar.findByPk as unknown as unknown as jest.Mock).mockRejectedValue(new Error('DB error'));
        await expect(
          (avatarResolvers.Mutation as any).replaceUserAvatar(
            null,
            { id_avatar: 2 },
            mockContext
          )
        ).rejects.toThrow("Erreur lors du traitement des données.");
      });
    });
  });
});

afterAll(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
  jest.unmock('fs-extra');
});