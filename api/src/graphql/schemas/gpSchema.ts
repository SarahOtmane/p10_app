import { gql } from 'apollo-server-express';

const gpTypeDefs = gql`
  type GP {
    id_api_races: Int!
    season: String!
    date: String!
    time: String!
    id_api_track: Int
  }

  type Query {
    getAllGPs: [GP!]!
    getGPById(id_api_races: Int!): GP
  }

  type Mutation {
    importGPsFromAPI(year: String!): String!
    updateGP(input: UpdateGPInput!): GP!
  }
`;

export default gpTypeDefs;
