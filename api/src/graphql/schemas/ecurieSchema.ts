import { gql } from 'apollo-server-express';

const ecurieTypeDefs = gql`
  type Ecurie {
    id_api_ecurie: Int!
    name: String!
    short_name: String
    logo: String
    color: String
  }

  input UpdateEcurieInput {
    id_api_ecurie: Int!
    name: String
    short_name: String
    logo: String
    color: String
  }

  type Query {
    getEcuries: [Ecurie!]!
    getEcurie(id_api_ecurie: Int!): Ecurie
  }

  type Mutation {
    updateEcurie(input: UpdateEcurieInput!): Ecurie
  }
`;

export default ecurieTypeDefs;
