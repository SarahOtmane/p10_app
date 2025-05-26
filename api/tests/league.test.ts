import leagueResolvers from '../src/graphql/resolvers/leagueResolver';
import League from '../src/models/leagueModel';
import User from '../src/models/userModel';
import UserLeague from '../src/models/user_leagueModel';
import { sendInvitationEmail } from '../src/utils/mailService';
import * as authUtils from '../src/utils/auth';

type LeagueResolversType = {
    Query: {
        getLeague: (...args: any[]) => any;
        getAllLeaguesOfUser: (...args: any[]) => any;
        getAllLeagues: (...args: any[]) => any;
    };
    Mutation: {
        createLeague: (...args: any[]) => any;
        updateLeague: (...args: any[]) => any;
        deleteLeague: (...args: any[]) => any;
        inviteUserToLeague: (...args: any[]) => any;
        acceptInvitationToLeague: (...args: any[]) => any;
    };
};
const typedLeagueResolvers = leagueResolvers as unknown as LeagueResolversType;

jest.mock('../src/models/leagueModel');
jest.mock('../src/models/userModel');
jest.mock('../src/models/user_leagueModel');
jest.mock('../src/utils/mailService');

// Mock utilisateur réutilisable
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

const mockContext = (user: any = mockUser) => ({ req: { user: user ?? mockUser } });

beforeAll(() => {
    jest.spyOn(authUtils, 'requireAuth').mockImplementation((ctx: any) => {
        if (!ctx.req || !ctx.req.user || !ctx.req.user.id_user) throw new Error('Utilisateur non authentifié.');
        return ctx.req.user;
    });
    jest.spyOn(authUtils, 'requireAdmin').mockImplementation((ctx: any) => {
        if (!ctx.req || !ctx.req.user || !ctx.req.user.id_user) throw new Error('Utilisateur non authentifié.');
        return ctx.req.user;
    });
});

describe('Query.getLeague', () => {
    it('returns league if user is member', async () => {
        (User.findByPk as unknown as jest.Mock).mockResolvedValue(mockUser);
        (League.findByPk as unknown as jest.Mock).mockResolvedValue({ id_league: 1 });
        (UserLeague.findOne as unknown as jest.Mock).mockResolvedValue({});

        const result = await typedLeagueResolvers.Query.getLeague(
            {},
            { id_league: 1 },
            mockContext()
        );
        expect(result).toEqual({ id_league: 1 });
    });

    it('throws if user not authenticated', async () => {
        await expect(
            typedLeagueResolvers.Query.getLeague({}, { id_league: 1 }, mockContext({}))
        ).rejects.toThrow('Utilisateur non authentifié.');
    });

    it('throws if user not found', async () => {
        (User.findByPk as unknown as jest.Mock).mockResolvedValue(null);
        await expect(
            typedLeagueResolvers.Query.getLeague({}, { id_league: 1 }, mockContext())
        ).rejects.toThrow('Utilisateur non trouvé.');
    });

    it('throws if league not found', async () => {
        (User.findByPk as unknown as jest.Mock).mockResolvedValue(mockUser);
        (League.findByPk as unknown as jest.Mock).mockResolvedValue(null);
        await expect(
            typedLeagueResolvers.Query.getLeague({}, { id_league: 1 }, mockContext())
        ).rejects.toThrow("La league spécifiée n'existe pas.");
    });

    it('throws if user not member', async () => {
        (User.findByPk as unknown as jest.Mock).mockResolvedValue(mockUser);
        (League.findByPk as unknown as jest.Mock).mockResolvedValue({ id_league: 1 });
        (UserLeague.findOne as unknown as jest.Mock).mockResolvedValue(null);
        await expect(
            typedLeagueResolvers.Query.getLeague({}, { id_league: 1 }, mockContext())
        ).rejects.toThrow('Vous ne faites pas partie de cette league.');
    });
});

describe('Query.getAllLeaguesOfUser', () => {
    it('returns leagues for user', async () => {
        (User.findByPk as unknown as jest.Mock).mockResolvedValue(mockUser);
        (League.findAll as unknown as jest.Mock).mockResolvedValue([{ id_league: 1 }]);
        const adminUser = { ...mockUser, role: 'admin', id_user: 1 };
        const context = mockContext(adminUser);
        const result = await typedLeagueResolvers.Query.getAllLeaguesOfUser({}, {}, context);
        expect(result).toEqual([{ id_league: 1 }]);
    });

    it('throws if user not authenticated', async () => {
        const context = mockContext({});
        await expect(
            typedLeagueResolvers.Query.getAllLeaguesOfUser({}, {}, context)
        ).rejects.toThrow("Utilisateur non authentifié.");
    });

    it('throws if user not found', async () => {
        (User.findByPk as unknown as jest.Mock).mockResolvedValue(null);
        const context = mockContext({ ...mockUser, role: 'admin' });
        await expect(
            typedLeagueResolvers.Query.getAllLeaguesOfUser({}, {}, context)
        ).rejects.toThrow("Utilisateur non trouvé.");
    });
});

describe('Query.getAllLeagues', () => {
    it('returns all leagues', async () => {
        (User.findByPk as unknown as jest.Mock).mockResolvedValue(mockUser);
        (League.findAll as unknown as jest.Mock).mockResolvedValue([{ id_league: 1 }]);
        const result = await typedLeagueResolvers.Query.getAllLeagues({}, {}, mockContext());
        expect(result).toEqual([{ id_league: 1 }]);
    });

    it('throws if user not authenticated', async () => {
        await expect(
            typedLeagueResolvers.Query.getAllLeagues({}, {}, mockContext({}))
        ).rejects.toThrow('Utilisateur non authentifié.');
    });

    it('throws if user not found', async () => {
        (User.findByPk as unknown as jest.Mock).mockResolvedValue(null);
        await expect(
            typedLeagueResolvers.Query.getAllLeagues({}, {}, mockContext())
        ).rejects.toThrow("Utilisateur non trouvé.");
    });
});

describe('Mutation.createLeague', () => {
    it('creates league and returns shared_link', async () => {
        (User.findByPk as unknown as jest.Mock).mockResolvedValue(mockUser);
        (League.create as unknown as jest.Mock).mockResolvedValue({
            getDataValue: (key: string) => (key === 'id_league' ? 1 : 'abcdefg'),
        });
        (UserLeague.create as unknown as jest.Mock).mockResolvedValue({});
        (League.findOne as unknown as jest.Mock).mockResolvedValue(null);

        const result = await typedLeagueResolvers.Mutation.createLeague(
            {},
            { name: 'Test', isPrivate: true },
            mockContext()
        );
        expect(result).toBe('abcdefg');
    });

    it('throws if user not authenticated', async () => {
        await expect(
            typedLeagueResolvers.Mutation.createLeague({}, { name: 'Test', isPrivate: true }, mockContext({}))
        ).rejects.toThrow("Error creating league");
    });

    it('throws if user not found', async () => {
        (User.findByPk as unknown as jest.Mock).mockResolvedValue(null);
        await expect(
            typedLeagueResolvers.Mutation.createLeague({}, { name: 'Test', isPrivate: true }, mockContext())
        ).rejects.toThrow("Error creating league");
    });
});

describe('Mutation.updateLeague', () => {
    it('updates league if admin', async () => {
        (User.findByPk as unknown as jest.Mock).mockResolvedValue(mockUser);
        (League.findByPk as unknown as jest.Mock).mockResolvedValue({ id_league: 1 });
        (UserLeague.findOne as unknown as jest.Mock).mockResolvedValue({ getDataValue: () => 'admin' });
        (League.update as unknown as jest.Mock).mockResolvedValue([1]);

        const result = await typedLeagueResolvers.Mutation.updateLeague(
            {},
            { id_league: 1, isPrivate: true, active: true },
            mockContext()
        );
        expect(result).toBe('League modifiée');
    });

    it('throws if not admin', async () => {
        (User.findByPk as unknown as jest.Mock).mockResolvedValue(mockUser);
        (League.findByPk as unknown as jest.Mock).mockResolvedValue({ id_league: 1 });
        (UserLeague.findOne as unknown as jest.Mock).mockResolvedValue({ getDataValue: () => 'user' });
        await expect(
            typedLeagueResolvers.Mutation.updateLeague(
                {},
                { id_league: 1, isPrivate: true, active: true },
                mockContext()
            )
        ).rejects.toThrow("Error updating league");
    });

    it('throws if league not found', async () => {
        (User.findByPk as unknown as jest.Mock).mockResolvedValue(mockUser);
        (League.findByPk as unknown as jest.Mock).mockResolvedValue(null);
        await expect(
            typedLeagueResolvers.Mutation.updateLeague(
                {},
                { id_league: 1, isPrivate: true, active: true },
                mockContext()
            )
        ).rejects.toThrow("Error updating league");
    });
});

describe('Mutation.deleteLeague', () => {
    it('deletes league if admin', async () => {
        (User.findByPk as unknown as jest.Mock).mockResolvedValue(mockUser);
        (League.findByPk as unknown as jest.Mock).mockResolvedValue({ id_league: 1 });
        (UserLeague.findOne as unknown as jest.Mock).mockResolvedValue({ getDataValue: () => 'admin' });
        (League.destroy as unknown as jest.Mock).mockResolvedValue(1);

        const result = await typedLeagueResolvers.Mutation.deleteLeague(
            {},
            { id_league: 1 },
            mockContext()
        );
        expect(result).toBe('League supprimé.');
    });

    it('throws if not admin', async () => {
        (User.findByPk as unknown as jest.Mock).mockResolvedValue(mockUser);
        (League.findByPk as unknown as jest.Mock).mockResolvedValue({ id_league: 1 });
        (UserLeague.findOne as unknown as jest.Mock).mockResolvedValue({ getDataValue: () => 'user' });
        await expect(
            typedLeagueResolvers.Mutation.deleteLeague(
                {},
                { id_league: 1 },
                mockContext()
            )
        ).rejects.toThrow("Error deleating league");
    });

    it('throws if league not found', async () => {
        (User.findByPk as unknown as jest.Mock).mockResolvedValue(mockUser);
        (League.findByPk as unknown as jest.Mock).mockResolvedValue(null);
        await expect(
            typedLeagueResolvers.Mutation.deleteLeague(
                {},
                { id_league: 1 },
                mockContext()
            )
        ).rejects.toThrow("Error deleating league");
    });
});

describe('Mutation.inviteUserToLeague', () => {
    it('sends invitation if all ok', async () => {
        (User.findByPk as unknown as jest.Mock).mockResolvedValue(mockUser);
        (League.findOne as unknown as jest.Mock).mockResolvedValue({ getDataValue: (k: string) => (k === 'id_league' ? 1 : 'abcdefg') });
        (UserLeague.findOne as unknown as jest.Mock)
            .mockResolvedValueOnce({}) // userLeague
            .mockResolvedValueOnce(null); // userLeagueInvited
        (User.findOne as unknown as jest.Mock).mockResolvedValue({ getDataValue: () => 2 });
        (sendInvitationEmail as unknown as jest.Mock).mockResolvedValue(undefined);

        const result = await typedLeagueResolvers.Mutation.inviteUserToLeague(
            {},
            { id_league: 1, email: 'test@test.com' },
            mockContext()
        );
        expect(result).toBe('Invitation envoyée');
        expect(sendInvitationEmail).toHaveBeenCalled();
    });

    it('throws if invited user already member', async () => {
        (User.findByPk as unknown as jest.Mock).mockResolvedValue(mockUser);
        (League.findOne as unknown as jest.Mock).mockResolvedValue({ getDataValue: (k: string) => (k === 'id_league' ? 1 : 'abcdefg') });
        (UserLeague.findOne as unknown as jest.Mock)
            .mockResolvedValueOnce({}) // userLeague
            .mockResolvedValueOnce({}); // userLeagueInvited
        (User.findOne as unknown as jest.Mock).mockResolvedValue({ getDataValue: () => 2 });

        await expect(
            typedLeagueResolvers.Mutation.inviteUserToLeague(
                {},
                { id_league: 1, email: 'test@test.com' },
                mockContext()
            )
        ).rejects.toThrow("L'utilisateur fait déjà partie de cette league.");
    });

    it('throws if invited user not found', async () => {
        (User.findByPk as unknown as jest.Mock).mockResolvedValue(mockUser);
        (League.findOne as unknown as jest.Mock).mockResolvedValue({ getDataValue: (k: string) => (k === 'id_league' ? 1 : 'abcdefg') });
        (UserLeague.findOne as unknown as jest.Mock).mockResolvedValueOnce({}); // userLeague
        (User.findOne as unknown as jest.Mock).mockResolvedValue(null);

        await expect(
            typedLeagueResolvers.Mutation.inviteUserToLeague(
                {},
                { id_league: 1, email: 'test@test.com' },
                mockContext()
            )
        ).rejects.toThrow("L'utilisateur n'existe pas.");
    });

    it('throws if league not found', async () => {
        (User.findByPk as unknown as jest.Mock).mockResolvedValue(mockUser);
        (League.findOne as unknown as jest.Mock).mockResolvedValue(null);

        await expect(
            typedLeagueResolvers.Mutation.inviteUserToLeague(
                {},
                { id_league: 1, email: 'test@test.com' },
                mockContext()
            )
        ).rejects.toThrow("La league spécifiée n'existe pas.");
    });

    it('throws if user not member', async () => {
        (User.findByPk as unknown as jest.Mock).mockResolvedValue(mockUser);
        (League.findOne as unknown as jest.Mock).mockResolvedValue({ getDataValue: (k: string) => (k === 'id_league' ? 1 : 'abcdefg') });
        (UserLeague.findOne as unknown as jest.Mock).mockResolvedValueOnce(null);

        await expect(
            typedLeagueResolvers.Mutation.inviteUserToLeague(
                {},
                { id_league: 1, email: 'test@test.com' },
                mockContext()
            )
        ).rejects.toThrow("Vous ne faites pas partie de cette league.");
    });
});

describe('Mutation.acceptInvitationToLeague', () => {
    it('joins league if all ok', async () => {
        (League.findOne as unknown as jest.Mock).mockResolvedValue({ getDataValue: (k: string) => (k === 'id_league' ? 1 : 'abcdefg') });
        (UserLeague.findOne as unknown as jest.Mock).mockResolvedValue(null);
        (UserLeague.create as unknown as jest.Mock).mockResolvedValue({});

        const result = await typedLeagueResolvers.Mutation.acceptInvitationToLeague(
            {},
            { shared_link: 'abcdefg' },
            mockContext()
        );
        expect(result).toBe('Vous avez rejoint la league avec succès.');
    });

    it('throws if league not found', async () => {
        (League.findOne as unknown as jest.Mock).mockResolvedValue(null);

        await expect(
            typedLeagueResolvers.Mutation.acceptInvitationToLeague(
                {},
                { shared_link: 'abcdefg' },
                mockContext()
            )
        ).rejects.toThrow('League introuvable.');
    });

    it('throws if already member', async () => {
        (League.findOne as unknown as jest.Mock).mockResolvedValue({ getDataValue: (k: string) => (k === 'id_league' ? 1 : 'abcdefg') });
        (UserLeague.findOne as unknown as jest.Mock).mockResolvedValue({});

        await expect(
            typedLeagueResolvers.Mutation.acceptInvitationToLeague(
                {},
                { shared_link: 'abcdefg' },
                mockContext()
            )
        ).rejects.toThrow('Vous êtes déjà membre de cette league.');
    });
});