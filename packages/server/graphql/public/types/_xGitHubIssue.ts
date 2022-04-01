import {GraphQLResolveInfo} from 'graphql'
import {_XGitHubIssueResolvers} from '../resolverTypes'

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

const _xGitHubIssue: _XGitHubIssueResolvers = {
  url: resolveToFieldNameOrAlias
}

export default _xGitHubIssue
