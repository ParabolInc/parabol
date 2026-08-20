import type {_XGitHubIssueResolvers} from '../resolverTypes'
import resolveToFieldNameOrAlias from '../resolveToFieldNameOrAlias'

const _xGitHubIssue: _XGitHubIssueResolvers = {
  url: resolveToFieldNameOrAlias,
  service: () => 'github'
}

export default _xGitHubIssue
