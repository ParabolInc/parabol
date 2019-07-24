import {GraphQLString} from 'graphql'
import {requireSU} from '../../../utils/authorization'

const pingActionTick = {
  type: GraphQLString,
  description: 'Check if this server is alive (an example query).',
  async resolve (source, args, {authToken}) {
    requireSU(authToken)
    return 'pong!'
  }
}

export default pingActionTick
