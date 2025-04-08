import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import userTypeDefs from './schemas/userSchema';
import userResolvers from './resolvers/userResolvers';
import ecurieTypeDefs from './schemas/ecurieSchema';
import ecurieResolvers from './resolvers/ecurieResolver';

const typeDefs = mergeTypeDefs([
    userTypeDefs,
    ecurieTypeDefs
]);
const resolvers = mergeResolvers([
    userResolvers,
    ecurieResolvers
]);

export { typeDefs, resolvers };
