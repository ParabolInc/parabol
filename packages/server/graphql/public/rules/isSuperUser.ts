import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import type {GQLContext} from '../../graphql'

const isSuperUser = rule({cache: 'contextual'})((_source, _args, {authToken}: GQLContext) => {
  return authToken?.rol === 'su'
    ? true
    : new GraphQLError('Not Parabol Admin', {extensions: {code: 'FORBIDDEN'}})
})

export default isSuperUser
