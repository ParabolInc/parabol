import {rule} from 'graphql-shield'
import {GQLContext} from '../../graphql'

const isSuperUser = rule({cache: 'contextual'})((_source, _args, {authToken}: GQLContext) => {
  return authToken?.rol === 'su' ? true : new Error('Not Parabol Admin')
})

export default isSuperUser
