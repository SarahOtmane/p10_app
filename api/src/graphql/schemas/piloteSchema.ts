import { gql } from 'apollo-server-express';

const piloteTypeDefs = gql`
  type Pilote {
    id_api_pilotes: ID!
    name: String!
    picture: String!
    name_acronym: String!
  }

  type Query {
    pilotes: [Pilote]
    pilote(id_api_pilotes: ID!): Pilote
  }

  type Mutation {
    registerAPilote(
        id_api_pilotes: ID!
        name: String!
        picture: String!
        name_acronym: String!
    ): Pilote
}
`;

export default piloteTypeDefs;