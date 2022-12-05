import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getPg from '../../../postgres/getPg'
import {appendUserFeatureFlagsQuery} from '../../../postgres/queries/generated/appendUserFeatureFlagsQuery'
import getUsersByDomain from '../../../postgres/queries/getUsersByDomain'
import {getUsersByEmails} from '../../../postgres/queries/getUsersByEmails'
import IUser from '../../../postgres/types/IUser'
import {getUserId, isSuperUser} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import segmentIo from '../../../utils/segmentIo'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const addFeatureFlag: MutationResolvers['addFeatureFlag'] = async (
  _source,
  {emails, domain, flag},
  {authToken, dataLoader}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId}

  // AUTH
  const viewerId = getUserId(authToken)
  const isAddingFlagToViewer = !emails?.length && !domain
  if (!isAddingFlagToViewer && !isSuperUser(authToken)) {
    return standardError(new Error('Not authorised to add feature flag'), {
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

  if (users.length === 0) {
    return {error: {message: 'No users found matching the email or domain'}}
  }

  const userIds = isAddingFlagToViewer ? [viewerId] : users.map(({id}) => id)
  await appendUserFeatureFlagsQuery.run({ids: userIds, flag}, getPg())
  userIds.forEach((userId) => {
    const data = {userId}
    publish(SubscriptionChannel.NOTIFICATION, userId, 'AddFeatureFlagPayload', data, subOptions)
  })

  if (isAddingFlagToViewer) {
    const viewer = await dataLoader.get('users').loadNonNull(viewerId)
    segmentIo.identify({
      userId: viewerId,
      traits: {
        eamil: viewer.email,
        featureFlags: viewer!.featureFlags
      }
    })
  } else {
    users.forEach(async ({id: userId, featureFlags}) => {
      const user = await dataLoader.get('users').loadNonNull(userId)
      segmentIo.identify({
        userId,
        traits: {
          email: user.email,
          featureFlags
        }
      })
    })
  }

  return {userIds}
}

export default addFeatureFlag
