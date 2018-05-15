import {GraphQLID, GraphQLNonNull} from 'graphql'
import CreateImposterTokenPayload from 'server/graphql/types/CreateImposterTokenPayload'
import {requireSU} from 'server/utils/authorization'
import sendAuthRaven from 'server/utils/sendAuthRaven'

const createImposterToken = {
  type: CreateImposterTokenPayload,
  description: 'for troubleshooting by admins, create a JWT for a given userId',
  args: {
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The target userId to impersonate'
    }
  },
  async resolve (source, {userId}, {authToken, dataLoader}) {
    // AUTH
    requireSU(authToken)

    // VALIDATION
    const user = await dataLoader.get('users').load(userId)
    if (!user) {
      const breadcrumb = {
        message: `User ${userId} does not exist`,
        category: 'Impersonate',
        data: {userId}
      }
      return sendAuthRaven(authToken, 'Listen here guy', breadcrumb)
    }

    // RESOLUTION
    return {userId}
  }
}

export default createImposterToken
