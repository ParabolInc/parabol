import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import type {RuleContext} from '../../graphql'

const isSuperUser = rule({cache: 'contextual'})((_source, _args, {authToken}: RuleContext) => {
  return authToken?.rol === 'su'
    ? true
    : new GraphQLError('Not Parabol Admin', {extensions: {code: 'FORBIDDEN'}})
})

export default isSuperUser
