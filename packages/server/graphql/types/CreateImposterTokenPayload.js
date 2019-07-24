import {GraphQLID, GraphQLObjectType} from 'graphql'
import {resolveUser} from '../resolvers'
import User from './User'
import tmsSignToken from '../../utils/tmsSignToken'
import StandardMutationError from './StandardMutationError'

const CreateImposterTokenPayload = new GraphQLObjectType({
  name: 'CreateImposterTokenPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    authToken: {
      type: GraphQLID,
      description: 'The new JWT',
      resolve: async (source, args, context) => {
        const user = await resolveUser(source, args, context)
        const {userId} = source
        const {tms} = user
        return tmsSignToken({sub: userId}, tms)
      }
    },
    user: {
      type: User,
      description: 'The user you have assumed',
      resolve: resolveUser
    }
  })
})

export default CreateImposterTokenPayload
