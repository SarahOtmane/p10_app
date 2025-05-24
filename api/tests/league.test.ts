import request from 'supertest';
import app from '../src/app';
import { sequelize } from '../src/config/database';
import User from '../src/models/userModel';

describe('League Resolver Integration Tests', () => {
    let token : string;
    let testUser;

    beforeAll(async () => {
        await sequelize.sync({ force: true });
        testUser = await User.create({ email: 'testuser@example.com', password: 'hashedpassword', firstname: 'Test', lastname: 'User', id_avatar: null, role: 'admin' });

        const loginRes = await request(app)
            .post('/graphql')
            .send({
                query: `
                  mutation {
                    login(email: "testuser@example.com", password: "hashedpassword") {
                      token
                      user {
                        id_user
                        email
                      }
                    }
                  }
                `,
            });

        token = loginRes.body.data.login.token;
    });

    afterAll(async () => {
        await sequelize.close();
    })

    describe('createLeague', () => {
        it('should create a league successfully', async () => {
            const res = await request(app)
                .post('/graphql')
                .set('Authorization', token)
                .send({
                    query: `
                        mutation {
                          createLeague(name: "Test League", isPrivate: false)
                        }
                    `,
                });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
        });

        it('should return an error if the user is not authenticated', async () => {
            const res = await request(app)
                .post('/graphql')
                .send({
                    query: `
                        mutation {
                          createLeague(name: "Test League", isPrivate: false)
                        }
                    `,
                });

            expect(res.body.errors[0].message).toBe('Utilisateur non authentifié.');
        });
    })

});