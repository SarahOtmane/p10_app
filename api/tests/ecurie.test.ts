import ecurieResolvers from '../src/graphql/resolvers/ecurieResolver';
import Ecurie from '../src/models/ecurieModel';
import { User } from '../src/models';
import { requireAuth } from '../src/utils/auth';
import { MyContext } from '../src/types/context';

jest.mock('../src/models/ecurieModel', () => ({
    __esModule: true,
    default: {
        findAll: jest.fn(),
        findByPk: jest.fn()
    }
}));
jest.mock('../src/models/userModel', () => ({
    __esModule: true,
    default: {
        findByPk: jest.fn()
    }
}));
jest.mock('../src/models', () => ({
    __esModule: true,
    User: { findByPk: jest.fn() }
}));
jest.mock('../src/utils/auth', () => ({
    requireAuth: jest.fn()
}));

const mockEcurie = {
    id_api_ecurie: 1,
    nom: 'Ecurie Test',
    update: jest.fn().mockResolvedValue(true)
};

const mockUser = {
    id_user: 1
};

const context: MyContext = {
    req: { headers: { authorization: 'Bearer token' } },
    res: {},
} as any;

describe('ecurieResolvers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Query', () => {
        describe('getEcuries', () => {
            it('should return all ecuries', async () => {
                (Ecurie.findAll as jest.Mock).mockResolvedValue([mockEcurie]);
                const result = await ecurieResolvers.Query['getEcuries']();
                expect(Ecurie.findAll).toHaveBeenCalled();
                expect(result).toEqual([mockEcurie]);
            });
        });

        describe('getEcurie', () => {
            it('should return ecurie by id', async () => {
                (Ecurie.findByPk as jest.Mock).mockResolvedValue(mockEcurie);
                const result = await ecurieResolvers.Query['getEcurie'](null, { id_api_ecurie: 1 });
                expect(Ecurie.findByPk).toHaveBeenCalledWith(1);
                expect(result).toEqual(mockEcurie);
            });

            it('should return null if ecurie not found', async () => {
                (Ecurie.findByPk as jest.Mock).mockResolvedValue(null);
                const result = await ecurieResolvers.Query['getEcurie'](null, { id_api_ecurie: 999 });
                expect(Ecurie.findByPk).toHaveBeenCalledWith(999);
                expect(result).toBeNull();
            });
        });
    });

    describe('Mutation', () => {
        describe('updateEcurie', () => {
            const input = { id_api_ecurie: 1, nom: 'Nouvelle Ecurie' };

            it('should update ecurie and return updated ecurie', async () => {
                (requireAuth as jest.Mock).mockReturnValue({ id_user: 1 });
                (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
                (Ecurie.findByPk as jest.Mock).mockResolvedValue({
                    ...mockEcurie,
                    update: jest.fn().mockResolvedValue(true)
                });

                const result = await (ecurieResolvers.Mutation as any).updateEcurie(null, { input }, context);
                expect(requireAuth).toHaveBeenCalledWith(context);
                expect(User.findByPk).toHaveBeenCalledWith(1);
                expect(Ecurie.findByPk).toHaveBeenCalledWith(1);
                expect(result).toHaveProperty('id_api_ecurie', 1);
            });

            it('should throw error if user not authenticated', async () => {
                (requireAuth as jest.Mock).mockReturnValue({});
                await expect(
                    (ecurieResolvers.Mutation as any).updateEcurie(null, { input }, context)
                ).rejects.toThrow('Utilisateur non authentifié.');
            });

            it('should throw error if user not found', async () => {
                (requireAuth as jest.Mock).mockReturnValue({ id_user: 1 });
                (User.findByPk as jest.Mock).mockResolvedValue(null);
                await expect(
                    (ecurieResolvers.Mutation as any).updateEcurie(null, { input }, context)
                ).rejects.toThrow('Utilisateur non trouvé.');
            });

            it('should throw error if ecurie not found', async () => {
                (requireAuth as jest.Mock).mockReturnValue({ id_user: 1 });
                (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
                (Ecurie.findByPk as jest.Mock).mockResolvedValue(null);
                await expect(
                    (ecurieResolvers.Mutation as any).updateEcurie(null, { input }, context)
                ).rejects.toThrow("Écurie non trouvée.");
            });
        });
    });
});