import { gql } from 'apollo-server-express';

const gpClassementTypeDefs = gql`
    type Mutation {
        implementOldGpClassement: String
    }
`;

export default gpClassementTypeDefs;
