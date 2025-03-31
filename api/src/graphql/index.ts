import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';

import piloteTypeDefs from './schemas/piloteSchema';
import piloteResolvers from './resolvers/piloteResolver';

import userTypeDefs from './schemas/userSchema';
import userResolvers from './resolvers/userResolvers';

const typeDefs = mergeTypeDefs([
    userTypeDefs,
    piloteTypeDefs,
]);
const resolvers = mergeResolvers([
    userResolvers, 
    piloteResolvers
]);

export { typeDefs, resolvers };
