import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import userTypeDefs from './schemas/userSchema';
import userResolvers from './resolvers/userResolvers';
import trackResolvers from './resolvers/tracksResolver';
import trackTypeDefs from './schemas/tracksSchema';

const typeDefs = mergeTypeDefs([
    userTypeDefs,
    trackTypeDefs
]);

const resolvers = mergeResolvers([
    userResolvers,
    trackResolvers
]);

export { typeDefs, resolvers };
