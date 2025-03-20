import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import userTypeDefs from './schemas/userSchema';
import userResolvers from './resolvers/userResolvers';

const typeDefs = mergeTypeDefs([userTypeDefs]);
const resolvers = mergeResolvers([userResolvers]);

export { typeDefs, resolvers };
