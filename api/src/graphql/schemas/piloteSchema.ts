import { gql } from 'apollo-server-express';

const piloteTypeDefs = gql`
  type Mutation {
    importDriversFromOpenF1: String
  }
`;

export default piloteTypeDefs;