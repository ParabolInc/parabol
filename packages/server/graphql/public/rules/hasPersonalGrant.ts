import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import type {RuleContext} from '../../graphql'

export const hasPersonalGrant = rule('hasPersonalGrant', {cache: 'contextual'})(
  (_source, _args, {resourceGrants}: RuleContext) =>
    !resourceGrants || resourceGrants.hasPersonal()
      ? true
      : new GraphQLError("This access token doesn't include your private pages and invitations", {
          extensions: {code: 'FORBIDDEN'}
        })
)
