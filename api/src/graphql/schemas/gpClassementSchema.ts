import { gql } from 'apollo-server-express';

const gpClassementTypeDefs = gql`
    type Mutation {
        implementOldGpClassement: String,
        implementLatestGpClassement: String
    }
`;

export default gpClassementTypeDefs;
