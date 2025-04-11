import { gql } from 'apollo-server-express';

const leagueTypeDefs = gql`
  type League {
    id_league : Int!
    name : String!
    private : Boolean!
    shared_link : String
    active : Boolean!
  }

  type Query {
    getLeague: [League!]!
  }

  type Mutation {
    createLeague(name: String!, private: Boolean!): String!
    updateLeague(id_league: Int!, private: Boolean!, active: Boolean!): String!
    deleteLeague(id_league: Int!): String!
  }
`;

export default leagueTypeDefs;