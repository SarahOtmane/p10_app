import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { connectDB } from './config/database';
import { typeDefs, resolvers } from './graphql';

const app = express();
const port = process.env.PORT || 3000;

// Initialiser Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  await connectDB(); // Connexion à la DB avant de démarrer le serveur

  app.listen(port, () => {
    console.log(`🚀 Serveur Express démarré sur http://localhost:${port}`);
    console.log(`📡 GraphQL disponible sur http://localhost:${port}${server.graphqlPath}`);
  });
}

startServer();
