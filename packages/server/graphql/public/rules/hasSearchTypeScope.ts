import {rule} from 'graphql-shield'
import type {RuleContext} from '../../graphql'
import {getMissingScopeError} from '../applyScopeDirective'
import type {OAuthScopeEnum, SearchTypeEnum, UserSearchArgs} from '../resolverTypes'

const SEARCH_TYPE_SCOPES = {
  page: 'pages:read',
  meetingTemplate: 'templates:read',
  retrospectiveDiscussionTopic: 'meetings:read'
} as const satisfies Record<SearchTypeEnum, OAuthScopeEnum>

export const hasSearchTypeScope = rule('hasSearchTypeScope', {cache: 'no_cache'})(
  (_source, {type}: UserSearchArgs, {authToken}: RuleContext) =>
    getMissingScopeError(authToken, SEARCH_TYPE_SCOPES[type]) ?? true
)
