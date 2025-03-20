import { gql } from 'apollo-server';

const userTypeDefs = gql`
  type User {
    id: ID!
    email: String!
    firstname: String!
    lastname: String!
    password: String!  # (À ne pas exposer normalement)
    role: String!
    id_avatar: ID
  }

  type Query {
    users: [User]
    user(id: ID!): User
  }

  type Mutation {
    createUser(email: String!, firstname: String!, lastname: String!, password: String!, role: String, id_avatar: ID): User
  }
`;

export default userTypeDefs;
