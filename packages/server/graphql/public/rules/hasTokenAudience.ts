import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import type {RuleContext} from '../../graphql'

export const hasTokenAudience = (audiences: string[]) =>
  rule(`hasTokenAudience-${audiences.join(',')}`, {cache: 'contextual'})(
    (_source, _args, {authToken}: RuleContext) => {
      return authToken && audiences.includes(authToken.aud)
        ? true
        : new GraphQLError('This kind of access token cannot do this', {
            extensions: {code: 'FORBIDDEN'}
          })
    }
  )
