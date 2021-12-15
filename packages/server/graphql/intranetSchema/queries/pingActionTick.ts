import {GQLContext} from './../../graphql'
import {GraphQLString} from 'graphql'
import {requireSU} from '../../../utils/authorization'

const pingActionTick = {
  type: GraphQLString,
  description: 'Check if this server is alive (an example query).',
  async resolve(_source: unknown, _args: unknown, {authToken}: GQLContext) {
    requireSU(authToken)
    return 'pong!'
  }
}

export default pingActionTick
