import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getPg from '../../../postgres/getPg'
import {appendUserFeatureFlagsQuery} from '../../../postgres/queries/generated/appendUserFeatureFlagsQuery'
import {removeUserFeatureFlagsQuery} from '../../../postgres/queries/generated/removeUserFeatureFlagsQuery'
import getUsersByDomain from '../../../postgres/queries/getUsersByDomain'
import {getUsersByEmails} from '../../../postgres/queries/getUsersByEmails'
import IUser from '../../../postgres/types/IUser'
import {getUserId, isSuperUser} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const updateFeatureFlag: MutationResolvers['updateFeatureFlag'] = async (
  _source,
  {emails, domain, flag, addFlag},
  {authToken, dataLoader}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId}

  // AUTH
  const viewerId = getUserId(authToken)
  const isUpdatingViewerFlag = !emails?.length && !domain
  if (!isUpdatingViewerFlag && !isSuperUser(authToken)) {
    return standardError(new Error('Not authorised to update feature flag'), {
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

  const userIds = isUpdatingViewerFlag ? [viewerId] : users.map(({id}) => id)
  addFlag
    ? await appendUserFeatureFlagsQuery.run({ids: userIds, flag}, getPg())
    : await removeUserFeatureFlagsQuery.run({ids: userIds, flag}, getPg())
  userIds.forEach((userId) => {
    const data = {userId}
    publish(SubscriptionChannel.NOTIFICATION, userId, 'UpdateFeatureFlagPayload', data, subOptions)
  })

  return {userIds}
}

export default updateFeatureFlag
