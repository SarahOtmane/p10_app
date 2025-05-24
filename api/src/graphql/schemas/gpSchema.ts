import { gql } from 'apollo-server-express';

const gpTypeDefs = gql`
  type GP {
    id_api_races: Int!
    season: String!
    date: String!
    time: String!
    id_api_track: Int
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    getAllGPs: [GP!]!
    getGPById(id_api_races: Int!): GP
  }

  type Mutation {
    importGPsFromAPI(year: String!): String!
  }
`;

export default gpTypeDefs;
