import { gql } from 'apollo-server-express';

const gpPilotesTypeDefs = gql`
    type GP_Pilotes {
        id: Int
        id_gp: Int
        id_pilote: Int
        id_ecurie: Int
    }

    type  Query {
        getAllGpPilotes: [GP_Pilotes!]!
    }
`;

export default gpPilotesTypeDefs;