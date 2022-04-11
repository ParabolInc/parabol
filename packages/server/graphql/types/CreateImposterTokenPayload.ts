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
      resolve: async ({userId}, _args, {dataLoader}) => {
        const user = await dataLoader.get('users').load(userId)
        const {tms} = user!
        return encodeAuthToken(new AuthToken({sub: userId, tms, rol: 'impersonate'}))
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
