import {GraphQLID, GraphQLObjectType} from 'graphql'
import {resolveUser} from '../resolvers'
import User from './User'
import StandardMutationError from './StandardMutationError'
import encodeAuthToken from '../../utils/encodeAuthToken'
import AuthToken from '../../database/types/AuthToken'
import {GQLContext} from '../graphql'

const CreateImposterTokenPayload = new GraphQLObjectType<any, GQLContext>({
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
        return encodeAuthToken(new AuthToken({sub: userId, tms}))
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
