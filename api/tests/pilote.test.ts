import piloteResolvers from '../src/graphql/resolvers/piloteResolver';
import Pilote from '../src/models/piloteModel';
import Ecurie from '../src/models/ecurieModel';
import PiloteEcurie from '../src/models/pilote_ecurieModel';
import { User } from '../src/models/';
import { requireAdmin } from '../src/utils/auth';
import fetch from 'node-fetch';

jest.mock('../src/models/piloteModel', () => ({
    __esModule: true,
    default: {
        findAll: jest.fn(),
        findByPk: jest.fn(),
        findOrCreate: jest.fn()
    }
}));
jest.mock('../src/models/ecurieModel', () => ({
    __esModule: true,
    default: {
        findOrCreate: jest.fn()
    }
}));
jest.mock('../src/models/pilote_ecurieModel', () => ({
    __esModule: true,
    default: {
        findOrCreate: jest.fn()
    }
}));
jest.mock('../src/models/', () => ({
    __esModule: true,
    User: { findByPk: jest.fn() }
}));
jest.mock('../src/utils/auth', () => ({
    requireAdmin: jest.fn()
}));
jest.mock('node-fetch', () => jest.fn());


const mockPilote = { getDataValue: jest.fn().mockImplementation((key) => key === 'id_api_pilotes' ? 1 : undefined) };
const mockEcurie = { getDataValue: jest.fn().mockImplementation((key) => key === 'id_api_ecurie' ? 2 : undefined) };
const mockUser = { id_user: 10 };

describe('piloteResolvers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Query', () => {
        describe('pilotes', () => {
            it('should return all pilotes', async () => {
                (Pilote.findAll as unknown as jest.Mock).mockResolvedValue([mockPilote]);
                const result = await (piloteResolvers as any).Query.pilotes();
                expect(Pilote.findAll).toHaveBeenCalled();
                expect(result).toEqual([mockPilote]);
            });

            it('should throw if findAll fails', async () => {
                (Pilote.findAll as unknown as jest.Mock).mockRejectedValue(new Error('DB error'));
                await expect((piloteResolvers.Query as any).pilotes()).rejects.toThrow('DB error');
            });
        });

        describe('pilote', () => {
            it('should return pilote by id', async () => {
                (Pilote.findByPk as unknown as jest.Mock).mockResolvedValue(mockPilote);
                const result = await (piloteResolvers.Query as any).pilote(null, { id_api_pilotes: 1 });
                expect(Pilote.findByPk).toHaveBeenCalledWith(1);
                expect(result).toBe(mockPilote);
            });

            it('should return null if not found', async () => {
                (Pilote.findByPk as unknown as jest.Mock).mockResolvedValue(null);
                const result = await (piloteResolvers.Query as any).pilote(null, { id_api_pilotes: 999 });
                expect(result).toBeNull();
            });

            it('should throw if findByPk fails', async () => {
                (Pilote.findByPk as unknown as jest.Mock).mockRejectedValue(new Error('DB error'));
                await expect(
                    (piloteResolvers.Query as any).pilote(null, { id_api_pilotes: 1 })
                ).rejects.toThrow('DB error');
            });
        });
    });

    describe('Mutation', () => {
        describe('importDriversFromOpenF1', () => {
            const context = {};

            const driverData = [
                {
                    first_name: 'Lewis',
                    last_name: 'Hamilton',
                    team_name: 'Mercedes',
                    team_colour: '#00D2BE',
                    name_acronym: 'HAM',
                    full_name: 'Lewis Hamilton',
                    headshot_url: 'url1'
                },
                {
                    first_name: 'Max',
                    last_name: 'Verstappen',
                    team_name: 'Red Bull',
                    team_colour: '#1E41FF',
                    name_acronym: 'VER',
                    full_name: 'Max Verstappen',
                    headshot_url: 'url2'
                },
                {
                    first_name: 'Lewis',
                    last_name: 'Hamilton',
                    team_name: 'Mercedes',
                    team_colour: '#00D2BE',
                    name_acronym: 'HAM',
                    full_name: 'Lewis Hamilton',
                    headshot_url: 'url1'
                }
            ];

            beforeEach(() => {
                (requireAdmin as unknown as jest.Mock).mockReturnValue(mockUser);
                (User.findByPk as unknown as jest.Mock).mockResolvedValue(mockUser);
                (fetch as unknown as jest.Mock).mockResolvedValue({
                    json: jest.fn().mockResolvedValue(driverData)
                });
                (Ecurie.findOrCreate as unknown as jest.Mock).mockResolvedValue([mockEcurie]);
                (Pilote.findOrCreate as unknown as jest.Mock).mockResolvedValue([mockPilote]);
                (PiloteEcurie.findOrCreate as unknown as jest.Mock).mockResolvedValue([{}]);
            });

            it('should import unique drivers and create records', async () => {
                const result = await (piloteResolvers.Mutation as any).importDriversFromOpenF1(null, null, context);
                expect(requireAdmin).toHaveBeenCalledWith(context);
                expect(User.findByPk).toHaveBeenCalledWith(mockUser.id_user);
                expect(fetch).toHaveBeenCalled();
                expect(Ecurie.findOrCreate).toHaveBeenCalledTimes(2);
                expect(Pilote.findOrCreate).toHaveBeenCalledTimes(2);
                expect(PiloteEcurie.findOrCreate).toHaveBeenCalledTimes(2);
                expect(result).toBe("Importation des pilotes terminée.");
            });

            it('should throw if user not authenticated', async () => {
                (requireAdmin as unknown as jest.Mock).mockReturnValue({});
                await expect(
                    (piloteResolvers.Mutation as any).importDriversFromOpenF1(null, null, context)
                ).rejects.toThrow("Utilisateur non authentifié.");
            });

            it('should throw if user not found', async () => {
                (requireAdmin as unknown as jest.Mock).mockReturnValue({ id_user: 99 });
                (User.findByPk as unknown as jest.Mock).mockResolvedValue(null);
                await expect(
                    (piloteResolvers.Mutation as any).importDriversFromOpenF1(null, null, context)
                ).rejects.toThrow("Utilisateur non trouvé.");
            });

            it('should throw if fetch fails', async () => {
                (fetch as unknown as jest.Mock).mockRejectedValue(new Error('fetch error'));
                await expect(
                    (piloteResolvers.Mutation as any).importDriversFromOpenF1(null, null, context)
                ).rejects.toThrow("Une erreur est survenue pendant l'importation.");
            });

            it('should throw if Ecurie.findOrCreate fails', async () => {
                (Ecurie.findOrCreate as unknown as jest.Mock).mockRejectedValue(new Error('ecurie error'));
                await expect(
                    (piloteResolvers.Mutation as any).importDriversFromOpenF1(null, null, context)
                ).rejects.toThrow("Une erreur est survenue pendant l'importation.");
            });

            it('should throw if Pilote.findOrCreate fails', async () => {
                (Pilote.findOrCreate as unknown as jest.Mock).mockRejectedValue(new Error('pilote error'));
                await expect(
                    (piloteResolvers.Mutation as any).importDriversFromOpenF1(null, null, context)
                ).rejects.toThrow("Une erreur est survenue pendant l'importation.");
            });

            it('should throw if PiloteEcurie.findOrCreate fails', async () => {
                (PiloteEcurie.findOrCreate as unknown as jest.Mock).mockRejectedValue(new Error('pe error'));
                await expect(
                    (piloteResolvers.Mutation as any).importDriversFromOpenF1(null, null, context)
                ).rejects.toThrow("Une erreur est survenue pendant l'importation.");
            });
        });
    });
});