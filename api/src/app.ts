import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { connectDB } from './config/database';
import { typeDefs, resolvers } from './graphql';
import TableManager from './config/createTablesDB';
import jwtMiddleware from './middlewares/jwtMiddleware';
import { MyContext } from './types/context';

const app = express();
const port = process.env.PORT || 3000;

// JSON body parser
app.use(express.json());

// Middleware JWT global (ajoute req.user si token valide)
app.use(jwtMiddleware.verifyToken);

// Apollo Server avec context pour injecter req/res
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res }),
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  await connectDB();
  await TableManager.createTables();

  app.listen(port, () => {
    console.log(`Serveur Express démarré sur http://localhost:${port}`);
    console.log(`GraphQL dispo sur http://localhost:${port}${server.graphqlPath}`);
  });
}

startServer();
