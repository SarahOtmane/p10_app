import { gql } from 'apollo-server-express';

const trackTypeDefs = gql`
  type Track {
    id_api_races: Int!
    country_name: String!
    track_name: String!
    picture_country: String!
    picture_track: String
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    getAllTracks: [Track!]!
    getTrackById(id_api_races: Int!): Track
  }
`;

export default trackTypeDefs;
