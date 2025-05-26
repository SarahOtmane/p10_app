import gpResolvers from '../src/graphql/resolvers/gpResolver';
import GP from '../src/models/gpModel';
import Tracks from '../src/models/trackModel';
import { User } from '../src/models/';
import { requireAdmin } from '../src/utils/auth';
import fetch from 'node-fetch';

jest.mock('node-fetch', () => jest.fn());
jest.mock('../src/models/gpModel', () => ({
    __esModule: true,
    default: {
        findAll: jest.fn(),
        findByPk: jest.fn(),
        create: jest.fn()
    }
}));
jest.mock('../src/models/trackModel', () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
        create: jest.fn()
    }
}));
jest.mock('../src/models/', () => ({
    __esModule: true,
    User: { findByPk: jest.fn() }
}));
jest.mock('../src/utils/auth', () => ({
    requireAdmin: jest.fn()
}));
global.fetch = jest.fn();

const mockGP = {
    id_api_races: 1,
    season: '2023',
    date: '2023-05-01',
    time: '12:00',
    id_api_track: 1,
    update: jest.fn()
};
const mockTrack = {
    getDataValue: jest.fn().mockReturnValue(1)
};
const mockUser = { id_user: 1 };
const context: any = { req: {}, res: {} };

beforeEach(() => {
    jest.clearAllMocks();
});

describe('gpResolvers', () => {
    describe('Query', () => {
        it('getAllGPs returns all GPs', async () => {
            (GP.findAll as unknown as unknown as unknown as jest.Mock).mockResolvedValue([mockGP]);
            const result = await gpResolvers.Query.getAllGPs();
            expect(GP.findAll).toHaveBeenCalled();
            expect(result).toEqual([mockGP]);
        });

        it('getGPById returns GP by id', async () => {
            (GP.findByPk as unknown as unknown as unknown as jest.Mock).mockResolvedValue(mockGP);
            const result = await gpResolvers.Query.getGPById(null, { id_api_races: 1 });
            expect(GP.findByPk).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockGP);
        });

        it('getGPById throws error if GP not found', async () => {
            (GP.findByPk as unknown as unknown as unknown as jest.Mock).mockResolvedValue(null);
            await expect(
                gpResolvers.Query.getGPById(null, { id_api_races: 999 })
            ).rejects.toThrow('GP introuvable.');
        });
    });

    describe('Mutation', () => {
        describe('importGPsAndTracks', () => {
            const racesApiResponse = {
                MRData: {
                    RaceTable: {
                        Races: [
                            {
                                round: '1',
                                season: '2023',
                                date: '2023-03-01',
                                time: '10:00Z',
                                Circuit: {
                                    circuitName: 'Track1',
                                    Location: { country: 'Country1' }
                                }
                            }
                        ]
                    }
                }
            };

            it('throws error if user not authenticated', async () => {
                (requireAdmin as unknown as unknown as unknown as jest.Mock).mockReturnValue({});
                await expect(
                    gpResolvers.Mutation.importGPsAndTracks(null, { year: '2023' }, context)
                ).rejects.toThrow('Utilisateur non authentifié.');
            });

            it('throws error if user not found', async () => {
                (requireAdmin as unknown as unknown as unknown as jest.Mock).mockReturnValue({ id_user: 1 });
                (User.findByPk as unknown as unknown as unknown as jest.Mock).mockResolvedValue(null);
                await expect(
                    gpResolvers.Mutation.importGPsAndTracks(null, { year: '2023' }, context)
                ).rejects.toThrow('Utilisateur non trouvé.');
            });

            it('imports GPs and tracks', async () => {
                (requireAdmin as unknown as unknown as unknown as jest.Mock).mockReturnValue({ id_user: 1 });
                (User.findByPk as unknown as unknown as unknown as jest.Mock).mockResolvedValue(mockUser);
                (fetch as unknown as unknown as unknown as jest.Mock).mockResolvedValue({
                    json: jest.fn().mockResolvedValue(racesApiResponse)
                });
                (Tracks.findOne as unknown as unknown as unknown as jest.Mock).mockResolvedValue(null);
                (Tracks.create as unknown as unknown as unknown as jest.Mock).mockResolvedValue(mockTrack);
                (GP.findByPk as unknown as unknown as unknown as jest.Mock).mockResolvedValue(null);
                (GP.create as unknown as unknown as unknown as jest.Mock).mockResolvedValue({});

                const result = await gpResolvers.Mutation.importGPsAndTracks(null, { year: '2023' }, context);
                expect(result).toContain("1 GPs et 1 tracks importés pour la saison 2023.");
            });

            it('skips existing tracks and GPs', async () => {
                (requireAdmin as unknown as unknown as unknown as jest.Mock).mockReturnValue({ id_user: 1 });
                (User.findByPk as unknown as unknown as unknown as jest.Mock).mockResolvedValue(mockUser);
                (fetch as unknown as unknown as unknown as jest.Mock).mockResolvedValue({
                    json: jest.fn().mockResolvedValue(racesApiResponse)
                });
                (Tracks.findOne as unknown as unknown as unknown as jest.Mock).mockResolvedValue(mockTrack);
                (GP.findByPk as unknown as unknown as unknown as jest.Mock).mockResolvedValue(true);

                const result = await gpResolvers.Mutation.importGPsAndTracks(null, { year: '2023' }, context);
                expect(result).toContain('0 GPs et 0 tracks importés');
            });

            it('throws error if fetch fails', async () => {
                (requireAdmin as unknown as unknown as unknown as jest.Mock).mockReturnValue({ id_user: 1 });
                (User.findByPk as unknown as unknown as unknown as jest.Mock).mockResolvedValue(mockUser);
                (fetch as unknown as unknown as unknown as jest.Mock).mockResolvedValue(new Error('fetch failed'));
                await expect(
                    gpResolvers.Mutation.importGPsAndTracks(null, { year: '2023' }, context)
                ).rejects.toThrow("Échec de l'importation depuis l'API.");
            });
        });

        describe('updateGP', () => {
            const input = { id_api_races: 1, season: '2024' };

            it('throws error if user not authenticated', async () => {
                (requireAdmin as unknown as unknown as unknown as jest.Mock).mockReturnValue({});
                await expect(
                    gpResolvers.Mutation.updateGP(null, { input }, context)
                ).rejects.toThrow('Utilisateur non authentifié.');
            });

            it('throws error if user not found', async () => {
                (requireAdmin as unknown as unknown as unknown as jest.Mock).mockReturnValue({ id_user: 1 });
                (User.findByPk as unknown as unknown as unknown as jest.Mock).mockResolvedValue(null);
                await expect(
                    gpResolvers.Mutation.updateGP(null, { input }, context)
                ).rejects.toThrow('Utilisateur non trouvé.');
            });

            it('throws error if GP not found', async () => {
                (requireAdmin as unknown as unknown as unknown as jest.Mock).mockReturnValue({ id_user: 1 });
                (User.findByPk as unknown as unknown as unknown as jest.Mock).mockResolvedValue(mockUser);
                (GP.findByPk as unknown as unknown as unknown as jest.Mock).mockResolvedValue(null);
                await expect(
                    gpResolvers.Mutation.updateGP(null, { input }, context)
                ).rejects.toThrow('Grand Prix introuvable.');
            });

            it('updates GP and returns updated GP', async () => {
                (requireAdmin as unknown as unknown as unknown as jest.Mock).mockReturnValue({ id_user: 1 });
                (User.findByPk as unknown as unknown as unknown as jest.Mock).mockResolvedValue(mockUser);
                const gpInstance = { ...mockGP, update: jest.fn().mockResolvedValue(true) };
                (GP.findByPk as unknown as unknown as unknown as jest.Mock).mockResolvedValue(gpInstance);

                const result = await gpResolvers.Mutation.updateGP(null, { input }, context);
                expect(gpInstance.update).toHaveBeenCalledWith({ season: '2024' });
                expect(result).toEqual(gpInstance);
            });

            it('throws error if update fails', async () => {
                (requireAdmin as unknown as unknown as unknown as jest.Mock).mockReturnValue({ id_user: 1 });
                (User.findByPk as unknown as unknown as unknown as jest.Mock).mockResolvedValue(mockUser);
                const gpInstance = { ...mockGP, update: jest.fn().mockRejectedValue(new Error('fail')) };
                (GP.findByPk as unknown as unknown as unknown as jest.Mock).mockResolvedValue(gpInstance);

                await expect(
                    gpResolvers.Mutation.updateGP(null, { input }, context)
                ).rejects.toThrow('Échec de la mise à jour du Grand Prix.');
            });
        });
    });
});