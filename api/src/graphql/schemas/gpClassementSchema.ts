import { gql } from 'apollo-server-express';

const gpClassementTypeDefs = gql`
    type GP {
        id: Int
        id_gp_pilote: Int
        position: Int
    }

    type  Query {
        getAllGpClassements: [GP!]!
    }

    type Mutation {
        implementOldGpClassement: String,
        implementGpClassementByDate(date: String!): String,
        implementLatestGpClassement: String
    }
`;

export default gpClassementTypeDefs;
