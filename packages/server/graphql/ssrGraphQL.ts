import schema from './rootSchema'
import graphql, {GQLContext} from './graphql'
import getQueryString from './getQueryString'

const ssrGraphQL = async (documentId: string, variables: object, context: GQLContext) => {
  const query = await getQueryString(documentId)
  return graphql(schema, query, {}, context, variables)
}

export default ssrGraphQL
