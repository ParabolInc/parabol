import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {USER_OVERLIMIT_COPY_LIMIT} from '../../../postgres/constants'
import updateUser from '../../../postgres/queries/updateUser'
import {requireSU} from '../../../utils/authorization'
import {GQLContext} from '../../graphql'
import FlagOverLimitPayload from '../../types/FlagOverLimitPayload'

const flagOverLimit = {
  type: FlagOverLimitPayload,
  description: 'add/remove a flag on a user saying they are over the free tier',
  args: {
    copy: {
      type: GraphQLString,
      description: 'The text body of the over limit message, null to remove the previous value',
      defaultValue: ''
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the user orgId that went over the limit'
    }
  },
  resolve: async (
    _source: unknown,
    {copy, orgId}: {copy: string; orgId: string},
    {authToken, dataLoader}: GQLContext
  ) => {
    // AUTH
    requireSU(authToken)

    // VALIDATION
    const organizationUsers = await dataLoader.get('organizationUsersByOrgId').load(orgId)
    if (organizationUsers.length === 0) return {error: {message: 'OrgId has no members'}}

    if (copy.length > USER_OVERLIMIT_COPY_LIMIT) {
      return {error: {message: `copy must be ${USER_OVERLIMIT_COPY_LIMIT} chars or less`}}
    }

    // RESOLUTION
    const userIds = organizationUsers.map(({userId}) => userId)
    await updateUser(
      {
        overLimitCopy: copy === null ? '' : copy
      },
      userIds
    )
    return {userIds}
  }
}

export default flagOverLimit
