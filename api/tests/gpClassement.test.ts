import gpClassementResolvers from '../src/graphql/resolvers/gpClassementResolver';
import fetch from 'node-fetch';
import GP from '../src/models/gpModel';
import Pilote from '../src/models/piloteModel';
import Ecurie from '../src/models/ecurieModel';
import GP_Pilotes from '../src/models/gp_pilotesModel';
import GP_Classement from '../src/models/gp_classementModel';
import { PilotesEcurie, User } from '../src/models/';
import { requireAuth, requireAdmin } from '../src/utils/auth';

jest.mock('node-fetch');
jest.mock('../src/models/gpModel');
jest.mock('../src/models/piloteModel');
jest.mock('../src/models/ecurieModel');
jest.mock('../src/models/gp_pilotesModel');
jest.mock('../src/models/gp_classementModel');
jest.mock('../src/models/', () => ({
  PilotesEcurie: { findOrCreate: jest.fn() },
  User: { findByPk: jest.fn() }
}));
jest.mock('../src/utils/auth', () => ({
  requireAuth: jest.fn(),
  requireAdmin: jest.fn()
}));

const mockContext = { req: {}, res: {} };

const mockUser = { id_user: 1 };
const mockExistingUser = { id_user: 1 };
const mockGP = { getDataValue: jest.fn((k) => k === 'id_api_races' ? 10 : undefined) };
const mockPilote = { getDataValue: jest.fn(() => 20) };
const mockEcurie = { getDataValue: jest.fn(() => 30) };
const mockGpPilote = { getDataValue: jest.fn(() => 40) };

beforeEach(() => {
  jest.clearAllMocks();
  (requireAuth as jest.Mock).mockReturnValue(mockUser);
  (requireAdmin as jest.Mock).mockReturnValue(mockUser); // Ajoute cette ligne
  (User.findByPk as jest.Mock).mockResolvedValue(mockExistingUser);
});

describe('gpClassementResolvers', () => {
  describe('Mutation.implementOldGpClassement', () => {
    it('should import classement successfully', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => [{ date: '2024-05-01' }]
        })
        .mockResolvedValueOnce({
          json: async () => [
            { driver: 'Lewis Hamilton', team: 'Mercedes', position: '1' }
          ]
        });
      (GP.findOne as jest.Mock).mockResolvedValue(mockGP);
      (Pilote.findOne as jest.Mock).mockResolvedValue(mockPilote);
      (Ecurie.findOne as jest.Mock).mockResolvedValue(mockEcurie);
      (PilotesEcurie.findOrCreate as jest.Mock).mockResolvedValue([{}]);
      (GP_Pilotes.findOrCreate as jest.Mock).mockResolvedValue([mockGpPilote]);
      (GP_Classement.findOrCreate as jest.Mock).mockResolvedValue([{}]);

      const result = await (gpClassementResolvers as any).Mutation.implementOldGpClassement(
        {}, {}, mockContext
      );
      expect(result).toBe('Importation du classement GP terminée');
    });

    it('should throw if user not authenticated', async () => {
      (requireAuth as jest.Mock).mockReturnValue({});
      await expect(
        (gpClassementResolvers as any).Mutation.implementOldGpClassement({}, {}, mockContext)
      ).rejects.toThrow("Erreur lors de l’importation du classement GP");
    });

    it('should throw if user not found', async () => {
      (requireAuth as jest.Mock).mockReturnValue(mockUser);
      (User.findByPk as jest.Mock).mockResolvedValue(null);
      await expect(
        (gpClassementResolvers as any).Mutation.implementOldGpClassement({}, {}, mockContext)
      ).rejects.toThrow("Utilisateur non trouvé.");
    });

    it('should throw if fetch dates returns invalid data', async () => {
      (fetch as unknown as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ not: 'an array' })
      });
      await expect(
        (gpClassementResolvers as any).Mutation.implementOldGpClassement({}, {}, mockContext)
      ).rejects.toThrow("Erreur lors de l’importation du classement GP");
    });

    it('should throw if classement fetch returns error', async () => {
      (fetch as unknown as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => [{ date: '2024-05-01' }]
        })
        .mockResolvedValueOnce({
          json: async () => ({ error: 'Erreur API' })
        });
      await expect(
        (gpClassementResolvers as any).Mutation.implementOldGpClassement({}, {}, mockContext)
      ).rejects.toThrow("Erreur lors de l’importation du classement GP");
    });

    it('should throw if GP not found', async () => {
      (fetch as unknown as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => [{ date: '2024-05-01' }]
        })
        .mockResolvedValueOnce({
          json: async () => [
            { driver: 'Lewis Hamilton', team: 'Mercedes', position: '1' }
          ]
        });
      (GP.findOne as jest.Mock).mockResolvedValue(null);
      await expect(
        (gpClassementResolvers as any).Mutation.implementOldGpClassement({}, {}, mockContext)
      ).rejects.toThrow("Erreur lors de l’importation du classement GP");
    });

    it('should throw if ecurie not found', async () => {
      (fetch as unknown as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => [{ date: '2024-05-01' }]
        })
        .mockResolvedValueOnce({
          json: async () => [
            { driver: 'Lewis Hamilton', team: 'Mercedes', position: '1' }
          ]
        });
      (GP.findOne as jest.Mock).mockResolvedValue(mockGP);
      (Pilote.findOne as jest.Mock).mockResolvedValue(mockPilote);
      (Ecurie.findOne as jest.Mock).mockResolvedValue(null);
      await expect(
        (gpClassementResolvers as any).Mutation.implementOldGpClassement({}, {}, mockContext)
      ).rejects.toThrow("Erreur lors de l’importation du classement GP");
    });
  });

  describe('Mutation.implementLatestGpClassement', () => {
    it('should import latest classement successfully', async () => {
      (fetch as unknown as jest.Mock).mockResolvedValueOnce({
        json: async () => [
          { driver: 'Lewis Hamilton', team: 'Mercedes', position: '1', scraped_at: '2024-05-01T12:00:00Z' }
        ]
      });
      (GP.findOne as jest.Mock).mockResolvedValue(mockGP);
      (Pilote.findOne as jest.Mock).mockResolvedValue(mockPilote);
      (Ecurie.findOne as jest.Mock).mockResolvedValue(mockEcurie);
      (PilotesEcurie.findOrCreate as jest.Mock).mockResolvedValue([{}]);
      (GP_Pilotes.findOrCreate as jest.Mock).mockResolvedValue([mockGpPilote]);
      (GP_Classement.findOrCreate as jest.Mock).mockResolvedValue([{}]);

      const result = await (gpClassementResolvers as any).Mutation.implementLatestGpClassement(
        {}, {}, mockContext
      );
      expect(result).toBe("Importation du classement du dernier GP terminée");
    });

    it('should throw if user not authenticated', async () => {
      (requireAuth as jest.Mock).mockReturnValue({});
      await expect(
        (gpClassementResolvers as any).Mutation.implementLatestGpClassement({}, {}, mockContext)
      ).rejects.toThrow('Utilisateur non authentifié.');
    });

    it('should throw if user not found', async () => {
      (requireAuth as jest.Mock).mockReturnValue(mockUser);
      (User.findByPk as jest.Mock).mockResolvedValue(null);
      await expect(
        (gpClassementResolvers as any).Mutation.implementLatestGpClassement({}, {}, mockContext)
      ).rejects.toThrow('Utilisateur non trouvé.');
    });

    it('should throw if classement fetch returns invalid data', async () => {
      (fetch as unknown as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ not: 'an array' })
      });
      await expect(
        (gpClassementResolvers as any).Mutation.implementLatestGpClassement({}, {}, mockContext)
      ).rejects.toThrow("Erreur lors de l’importation du classement du dernier GP");
    });

    it('should throw if scraped_at missing', async () => {
      (fetch as unknown as jest.Mock).mockResolvedValueOnce({
        json: async () => [{ driver: 'Lewis Hamilton', team: 'Mercedes', position: '1' }]
      });
      await expect(
        (gpClassementResolvers as any).Mutation.implementLatestGpClassement({}, {}, mockContext)
      ).rejects.toThrow("Erreur lors de l’importation du classement du dernier GP");
    });

    it('should throw if GP not found', async () => {
      (fetch as unknown as jest.Mock).mockResolvedValueOnce({
        json: async () => [
          { driver: 'Lewis Hamilton', team: 'Mercedes', position: '1', scraped_at: '2024-05-01T12:00:00Z' }
        ]
      });
      (GP.findOne as jest.Mock).mockResolvedValue(null);
      await expect(
        (gpClassementResolvers as any).Mutation.implementLatestGpClassement({}, {}, mockContext)
      ).rejects.toThrow("Erreur lors de l’importation du classement du dernier GP");
    });
  });
});