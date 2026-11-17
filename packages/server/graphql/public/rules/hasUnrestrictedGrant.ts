import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import type {RuleContext} from '../../graphql'

export const hasUnrestrictedGrant = rule('hasUnrestrictedGrant', {cache: 'contextual'})(
  (_source, _args, {resourceGrants}: RuleContext) =>
    !resourceGrants || resourceGrants.isUnrestricted()
      ? true
      : new GraphQLError('This access token is limited to specific organizations, teams or pages', {
          extensions: {code: 'FORBIDDEN'}
        })
)
