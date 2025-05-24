import { gql } from 'apollo-server-express';

const resultTypeDefs = gql`
  type Result {
    id: Int!
    point_p10: Int!
    id_pilote_p10: Int!
    id_user: Int!
    id_gp: Int!
  }

  type Query {
    getAllResultsOfUser: [Result!]!
    getResultOfUserById(id: Int!): Result
  }
`;

export default resultTypeDefs;