import schema from 'server/graphql/rootSchema'
import graphql, {GQLContext} from './graphql'

const ssrGraphQL = async (documentId: string, variables: object, context: GQLContext) => {
  // dirty hack so we can build the schema before this requires that built schema
  const queryMap = require('server/graphql/queryMap.json')
  const query = queryMap[documentId]
  return graphql(schema, query, {}, context, variables)
}

export default ssrGraphQL
