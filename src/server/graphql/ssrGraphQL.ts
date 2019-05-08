import queryMap from 'server/graphql/queryMap.json'
import schema from 'server/graphql/rootSchema'
import graphql, {GQLContext} from './graphql'

const ssrGraphQL = async (documentId: string, variables: object, context: GQLContext) => {
  const query = queryMap[documentId]
  const result = await graphql(schema, query, {}, context, variables)
  return (result as any).data
}

export default ssrGraphQL
