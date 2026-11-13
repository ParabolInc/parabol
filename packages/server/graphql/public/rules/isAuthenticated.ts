import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import type {RuleContext} from '../../graphql'

const isAuthenticated = rule({cache: 'contextual'})((_source, _args, {authToken}: RuleContext) => {
  return typeof authToken?.sub === 'string'
    ? true
    : new GraphQLError('Not signed in', {extensions: {code: 'UNAUTHENTICATED'}})
})

export default isAuthenticated
