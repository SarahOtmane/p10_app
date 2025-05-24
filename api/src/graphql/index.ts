import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';

import userTypeDefs from './schemas/userSchema';
import userResolvers from './resolvers/userResolvers';

import avatarTypeDefs from './schemas/avatarSchema';
import avatarResolvers from './resolvers/avatarResolver';

import leagueTypeDefs from './schemas/leagueSchema';
import leagueResolvers from './resolvers/leagueResolver';

import resultResolvers from './resolvers/resultResolver';
import resultTypeDefs from './schemas/resultSchema';

import trackTypeDefs from './schemas/trackSchema';
import trackResolvers from './resolvers/trackResolver';
import gpTypeDefs from './schemas/gpSchema';
import gpResolvers from './resolvers/gpResolver';

export const typeDefs = mergeTypeDefs([
  userTypeDefs,
  avatarTypeDefs,
  leagueTypeDefs,
  resultTypeDefs,
  trackTypeDefs,
  gpTypeDefs,
]);

export const resolvers = mergeResolvers([
  userResolvers,
  avatarResolvers,
  leagueResolvers,
  resultResolvers,
  trackResolvers,
  gpResolvers,
]);
