import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { connectDB } from './config/database';
import { typeDefs, resolvers } from './graphql';
import TableManager from './config/tableManager';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// JSON body parser
app.use(express.json());

// pour que le front puisse acceder au dossier images
app.use('/images', express.static(path.join(__dirname, '../public/images')));

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
