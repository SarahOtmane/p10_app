import resultResolvers from '../src/graphql/resolvers/resultResolver';
import Result from '../src/models/resultModel';
import User from '../src/models/userModel';
import GP from '../src/models/gpModel';
import { requireAuth } from '../src/utils/auth';

// api/src/graphql/resolvers/resultResolver.test.ts

jest.mock('../src/models/resultModel');
jest.mock('../src/models/userModel');
jest.mock('../src/models/gpModel');
jest.mock('../src/utils/auth', () => ({
  requireAuth: jest.fn(),
}));


const mockContext = { req: { user: { id_user: 123 } } };

describe('resultResolvers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Query', () => {
    describe('getAllResultsOfUser', () => {
      it('should return all results for authenticated user', async () => {
        (requireAuth as jest.Mock).mockReturnValue({ id_user: 123 });
        (Result.findAll as jest.Mock).mockResolvedValue([{ id_result: 1 }, { id_result: 2 }]);
        const results = await (resultResolvers.Query as any).getAllResultsOfUser(null, null, mockContext);
        expect(requireAuth).toHaveBeenCalledWith(mockContext);
        expect(Result.findAll).toHaveBeenCalledWith({
          where: { id_user: 123 },
          include: [
            { model: GP },
            { model: User, attributes: ['id_user', 'email'] }
          ]
        });
        expect(results).toEqual([{ id_result: 1 }, { id_result: 2 }]);
      });

      it('should throw if requireAuth throws', async () => {
        (requireAuth as jest.Mock).mockImplementation(() => { throw new Error('Auth error'); });
        await expect(
          (resultResolvers.Query as any).getAllResultsOfUser(null, null, mockContext)
        ).rejects.toThrow('Auth error');
      });

      it('should throw if Result.findAll throws', async () => {
        (requireAuth as jest.Mock).mockReturnValue({ id_user: 123 });
        (Result.findAll as jest.Mock).mockRejectedValue(new Error('DB error'));
        await expect(
          (resultResolvers.Query as any).getAllResultsOfUser(null, null, mockContext)
        ).rejects.toThrow('DB error');
      });
    });

    describe('getResultOfUserById', () => {
      it('should return the result if it exists and belongs to user', async () => {
        (requireAuth as jest.Mock).mockReturnValue({ id_user: 123 });
        (Result.findOne as jest.Mock).mockResolvedValue({ id_result: 5, id_user: 123 });
        const result = await (resultResolvers.Query as any).getResultOfUserById(
          null,
          { id: 5 },
          mockContext
        );
        expect(requireAuth).toHaveBeenCalledWith(mockContext);
        expect(Result.findOne).toHaveBeenCalledWith({
          where: { id_result: 5, id_user: 123 },
          include: [
            { model: GP },
            { model: User, attributes: ['id_user', 'email'] }
          ]
        });
        expect(result).toEqual({ id_result: 5, id_user: 123 });
      });

      it('should throw if requireAuth throws', async () => {
        (requireAuth as jest.Mock).mockImplementation(() => { throw new Error('Auth error'); });
        await expect(
          (resultResolvers.Query as any).getResultOfUserById(null, { id: 5 }, mockContext)
        ).rejects.toThrow('Auth error');
      });

      it('should throw if Result.findOne throws', async () => {
        (requireAuth as jest.Mock).mockReturnValue({ id_user: 123 });
        (Result.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));
        await expect(
          (resultResolvers.Query as any).getResultOfUserById(null, { id: 5 }, mockContext)
        ).rejects.toThrow('DB error');
      });

      it('should throw if result not found', async () => {
        (requireAuth as jest.Mock).mockReturnValue({ id_user: 123 });
        (Result.findOne as jest.Mock).mockResolvedValue(null);
        await expect(
          (resultResolvers.Query as any).getResultOfUserById(null, { id: 5 }, mockContext)
        ).rejects.toThrow("Résultat introuvable ou accès non autorisé.");
      });
    });
  });
});