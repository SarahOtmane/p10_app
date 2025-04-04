import { gql } from 'apollo-server';
const GPTypeDefs = gql`

type GP {
    id_api_races: ID!
    season: String!
    date: String!
    time: String!
    id_api_tracks: ID!
}

type Query {
    gps: [GP]
    gp(id_api_races: ID!): GP
}

type Mutation {
    createGP(season: String!, date: String!, time: String!, id_api_tracks: ID!): GP
    updateGP(id_api_races: ID!, season: String, date: String, time: String, id_api_tracks: ID): GP
    deleteGP(id_api_races: ID!): String
}
 `;
export default GPTypeDefs;
