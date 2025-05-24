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
    getAllLeagues: [League!]!
    getAllLeaguesOfUser: [League!]!
    getLeague(id_league: Int!): League!
  }

  type Mutation {
    createLeague(name: String!, isPrivate: Boolean!): String!
    updateLeague(id_league: Int!, isPrivate: Boolean!, active: Boolean!): String!
    deleteLeague(id_league: Int!): String!
    inviteUserToLeague(id_league: Int!, email: String!): String!
    acceptInvitationToLeague(shared_link: String!): String!
  }
`;

export default leagueTypeDefs;