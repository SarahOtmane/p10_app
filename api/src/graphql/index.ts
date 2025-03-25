import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';

import userTypeDefs from './schemas/userSchema';
import userResolvers from './resolvers/userResolvers';

import { avatarTypeDefs } from './schemas/avatarSchema';
import { avatarResolvers } from './resolvers/avatarResolver';

export const typeDefs = mergeTypeDefs([
  userTypeDefs,
  avatarTypeDefs
]);

export const resolvers = mergeResolvers([
  userResolvers,
  avatarResolvers
]);
