import importTypeDefs from '../importTypeDefs'

export const typeDefs = importTypeDefs(require.context('./typeDefs', false, /.graphql$/))
