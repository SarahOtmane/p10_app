import { gql } from 'apollo-server-express';

const avatarTypeDefs = gql`
  type Avatar {
    id_avatar: ID!
    picture_avatar: String!
  }

  type Query {
    getAllAvatars: [Avatar]
  }

  type Mutation {
    addAvatar(picture_avatar: String!): String
    updateAvatar(id_avatar: ID!, picture_avatar: String!): String
    deleteAvatar(id_avatar: ID!): String
    replaceUserAvatar(id_avatar: ID!): String
  }
`;

export default avatarTypeDefs;