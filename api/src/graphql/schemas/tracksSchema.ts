import { gql } from 'apollo-server';

const trackTypeDefs = gql`
  type Track {
    id_api_races: ID!
    country_name: String!
    track_name: String!
    picture_country: String!
    picture_track: String!
  }

  type Query {
    tracks: [Track]
    track(id_api_races: ID!): Track
  }

  type Mutation {
    createATrack(
        id_api_races: ID!
        country_name: String!
        track_name: String!
        picture_country: String!
        picture_track: String!
    ): Track
  }
`;

export default trackTypeDefs;