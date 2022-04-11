import {GraphQLID, GraphQLNonNull} from 'graphql'
import {getUserByEmail} from '../../postgres/queries/getUsersByEmails'
import {getUserId, requireSU} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import CreateImposterTokenPayload from '../types/CreateImposterTokenPayload'
import GraphQLEmailType from '../types/GraphQLEmailType'

const createImposterToken = {
  type: new GraphQLNonNull(CreateImposterTokenPayload),
  description: 'for troubleshooting by admins, create a JWT for a given userId',
  args: {
    userId: {
      type: GraphQLID,
      description: 'The target userId to impersonate'
    },
    email: {
      type: GraphQLEmailType,
      description: 'The email address of the user to impersonate'
    }
  },
  async resolve(
    _source: unknown,
    {email, userId}: {email: string | null; userId: string | null},
    {authToken, dataLoader}: GQLContext
  ) {
    // AUTH
    requireSU(authToken)
    const viewerId = getUserId(authToken)

    // VALIDATION
    const user = userId
      ? await dataLoader.get('users').load(userId)
      : email
      ? await getUserByEmail(email)
      : null

    if (!user) {
      return standardError(new Error('User not found'), {userId: viewerId})
    }

    // RESOLUTION
    return {userId: user.id}
  }
}

export default createImposterToken
