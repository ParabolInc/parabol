import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import type {GQLContext} from '../../graphql'

const isAuthenticated = rule({cache: 'contextual'})((_source, _args, {authToken}: GQLContext) => {
  return typeof authToken?.sub === 'string'
    ? true
    : new GraphQLError('Not signed in', {extensions: {code: 'UNAUTHORIZED'}})
})

export default isAuthenticated
