import {rule} from 'graphql-shield'
import type {GQLContext} from '../../graphql'

const isAuthenticated = rule({cache: 'contextual'})((_source, _args, {authToken}: GQLContext) => {
  return typeof authToken?.sub === 'string' ? true : new Error('Not signed in')
})

export default isAuthenticated
