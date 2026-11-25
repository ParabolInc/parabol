import {rule} from 'graphql-shield'
import type {RuleContext} from '../../graphql'
import {getMissingScopeError} from '../applyScopeDirective'
import type {OAuthScopeEnum} from '../resolverTypes'

export const hasScope = (scope: OAuthScopeEnum) =>
  rule(`hasScope-${scope}`, {cache: 'contextual'})(
    (_source, _args, {authToken}: RuleContext) => getMissingScopeError(authToken, scope) ?? true
  )
