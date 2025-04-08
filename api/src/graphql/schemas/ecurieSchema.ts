import { gql } from 'apollo-server';

const ecurieTypeDefs = gql`
  type Ecurie {
    id_api_ecurie: ID!
    name: String!
    logo: String!
    color: String!
  }

  type Query {
    ecuries: [Ecurie]
    ecurie(id_api_ecurie: ID!): Ecurie
  }

  type Mutation {
    createAnEcurie(
        id_api_ecurie: ID!
        name: String!
        logo: String!
        color: String!
    ): Ecurie
  }
`;

export default ecurieTypeDefs;