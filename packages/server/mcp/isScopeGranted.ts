import type {OAuthScopeEnum} from '../graphql/public/resolverTypes'
import type {MCPContext} from './MCPContext'

const isScopeGranted = ({grant}: Pick<MCPContext, 'grant'>, scope: OAuthScopeEnum) =>
  grant.scopes.includes(scope)

export default isScopeGranted
