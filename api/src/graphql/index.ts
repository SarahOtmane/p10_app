import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import userTypeDefs from './schemas/userSchema';
import userResolvers from './resolvers/userResolvers';
import GPTypeDefs from './schemas/GPSchema';
import gpResolvers from './resolvers/GPResolvers';

const typeDefs = mergeTypeDefs([
    userTypeDefs,
    GPTypeDefs,
]);
const resolvers = mergeResolvers([
    userResolvers, 
    gpResolvers,
]);
export { typeDefs, resolvers };
