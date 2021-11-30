import {GraphQLList, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import standardError from '../../utils/standardError'
import getPg from '../../postgres/getPg'
import {appendUserFeatureFlagsQuery} from '../../postgres/queries/generated/appendUserFeatureFlagsQuery'
import getUsersByDomain from '../../postgres/queries/getUsersByDomain'
import {getUserByEmail, getUsersByEmails} from '../../postgres/queries/getUsersByEmails'
import IUser from '../../postgres/types/IUser'
import {getUserId, isSuperUser} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import AddFeatureFlagPayload from '../types/AddFeatureFlagPayload'
import UserFlagEnum, {UserFeatureFlagEnum} from '../types/UserFlagEnum'

export default {
  type: new GraphQLNonNull(AddFeatureFlagPayload),
  description: 'Give someone advanced features in a flag',
  args: {
    emails: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
      description: `a list of the complete or partial email of the person to whom you are giving advanced features.
      Matches via a regex to support entire domains`
    },
    domain: {
      type: GraphQLString,
      description: 'grant access to an entire domain. the part of the email after the @'
    },
    flag: {
      type: new GraphQLNonNull(UserFlagEnum),
      description: 'the flag that you want to give to the user'
    }
  },
  async resolve(
    _source: unknown,
    {
      emails,
      domain,
      flag
    }: {emails: string[] | null; domain: string | null; flag: UserFeatureFlagEnum},
    {authToken, dataLoader}: GQLContext
  ) {
    const operationId = dataLoader.share()
    const subOptions = {operationId}

    // AUTH
    if (!isSuperUser(authToken)) {
      const viewerId = getUserId(authToken)
      const user = emails && (await getUserByEmail(emails[0]))
      if (domain || (emails && emails?.length > 1) || user?.id !== viewerId) {
        return standardError(new Error('Cannot add feature flag for a different user'), {
          userId: viewerId
        })
      }
    }

    // RESOLUTION
    const users = [] as IUser[]
    if (emails) {
      const usersByEmail = await getUsersByEmails(emails)
      users.push(...usersByEmail)
    }
    if (domain) {
      const usersByDomain = await getUsersByDomain(domain)
      users.push(...usersByDomain)
    }

    if (users.length === 0) {
      return {error: {message: 'No users found matching the email or domain'}}
    }

    const userIds = users.map(({id}) => id)
    await appendUserFeatureFlagsQuery.run({ids: userIds, flag}, getPg())
    userIds.forEach((userId) => {
      const data = {userId}
      publish(SubscriptionChannel.NOTIFICATION, userId, 'AddFeatureFlagPayload', data, subOptions)
    })
    return {userIds}
  }
}
