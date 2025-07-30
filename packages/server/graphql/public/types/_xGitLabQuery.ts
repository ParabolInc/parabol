import type {GraphQLResolveInfo} from 'graphql'
import type {_XGitLabQueryResolvers} from '../resolverTypes'

const resolveToFieldNameOrAlias = (
  source: any,
  _args: unknown,
  _context: unknown,
  info: GraphQLResolveInfo
) => {
  // fieldNodes will always have 1+ node
  const key = info.fieldNodes[0]!.alias?.value ?? info.fieldName
  return source[key]
}

const _xGitLabQuery: _XGitLabQueryResolvers = {
  projects: resolveToFieldNameOrAlias
}

export default _xGitLabQuery
