import { gql } from 'apollo-server-express';

const userTypeDefs = gql`
  type User {
    id: ID!
    email: String!
    firstname: String!
    lastname: String!
    role: String!
    id_avatar: ID
  }

  type Query {
    users: [User]
    user(id: ID!): User
  }

  type Mutation {
    registerAUser(
      email: String!
      firstname: String!
      lastname: String!
      password: String!
      role: String
      id_avatar: ID
    ): User
    loginAUser(email: String!, password: String!): String
    updateUser(
      firstname: String!
      lastname: String!
      password: String!
      id_avatar: ID
      role: String
    ): String
    deleteUser: String
  }
`;

export default userTypeDefs;
