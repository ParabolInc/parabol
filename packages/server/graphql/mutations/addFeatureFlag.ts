import {getUserById} from './../../postgres/queries/getUsersByIds'
import {requireSU} from './../../utils/authorization'
import {GraphQLList, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import standardError from '../../utils/standardError'
import getPg from '../../postgres/getPg'
import {appendUserFeatureFlagsQuery} from '../../postgres/queries/generated/appendUserFeatureFlagsQuery'
import getUsersByDomain from '../../postgres/queries/getUsersByDomain'
import {getUsersByEmails} from '../../postgres/queries/getUsersByEmails'
import IUser from '../../postgres/types/IUser'
import {getUserId} from '../../utils/authorization'
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
    const viewerId = getUserId(authToken)
    const viewer = await getUserById(viewerId)
    const isAddingFlagToViewer = !emails?.length && !domain
    if (!isAddingFlagToViewer) {
      requireSU(authToken)
    } else if (!viewer) {
      return standardError(new Error('Unable to find viewer'), {
        userId: viewerId
      })
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
    if (isAddingFlagToViewer) {
      users.push(viewer!)
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
