import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import getUsersByDomain from '../../../postgres/queries/getUsersByDomain'
import {getUsersByEmails} from '../../../postgres/queries/getUsersByEmails'
import {getUserId, isSuperUser} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const applyFeatureFlag: MutationResolvers['applyFeatureFlag'] = async (
  _source,
  {flagName, subjects},
  {authToken, dataLoader}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId}
  const pg = getKysely()

  // AUTH
  const viewerId = getUserId(authToken)
  if (!isSuperUser(authToken)) {
    return standardError(new Error('Not authorized to apply feature flag'), {
      userId: viewerId
    })
  }

  // VALIDATION
  const subjectKeys = Object.keys(subjects)

  if (subjectKeys.length === 0) {
    return standardError(new Error('At least one subject type must be provided'), {
      userId: viewerId
    })
  }

  // RESOLUTION
  const featureFlag = await pg
    .selectFrom('FeatureFlag')
    .select(['id', 'scope'])
    .where('featureName', '=', flagName)
    .executeTakeFirst()

  if (!featureFlag) {
    return standardError(new Error('Feature flag not found'), {userId: viewerId})
  }

  const {id: featureFlagId, scope} = featureFlag
  const userIds: string[] = []
  const teamIds: string[] = []
  const orgIds: string[] = []

  for (const subjectType of subjectKeys) {
    const subjectValue = subjects[subjectType as keyof typeof subjects]
    if (!subjectValue || subjectValue.length === 0) continue

    switch (subjectType) {
      case 'emails':
        const users = await getUsersByEmails(subjectValue)
        userIds.push(...users.map((user) => user.id))
        break
      case 'domains':
        for (const domain of subjectValue) {
          const domainUsers = await getUsersByDomain(domain)
          userIds.push(...domainUsers.map((user) => user.id))
        }
        break
      case 'userIds':
        userIds.push(...subjectValue)
        break
      case 'teamIds':
        teamIds.push(...subjectValue)
        break
      case 'orgIds':
        orgIds.push(...subjectValue)
        break
    }
  }

  if (userIds.length > 0 && scope !== 'User') {
    return standardError(new Error('Scope mismatch: Feature flag is not for User scope'), {
      userId: viewerId
    })
  }
  if (teamIds.length > 0 && scope !== 'Team') {
    return standardError(new Error('Scope mismatch: Feature flag is not for Team scope'), {
      userId: viewerId
    })
  }
  if (orgIds.length > 0 && scope !== 'Organization') {
    return standardError(new Error('Scope mismatch: Feature flag is not for Organization scope'), {
      userId: viewerId
    })
  }

  const targetIds = scope === 'User' ? userIds : scope === 'Team' ? teamIds : orgIds

  for (const targetId of targetIds) {
    await pg
      .insertInto('FeatureFlagOwner')
      .values({
        featureFlagId,
        userId: scope === 'User' ? targetId : null,
        teamId: scope === 'Team' ? targetId : null,
        orgId: scope === 'Organization' ? targetId : null
      })
      .onConflict((oc) => oc.doNothing())
      .execute()

    const data = {targetId, featureFlagId}
    publish(SubscriptionChannel.NOTIFICATION, targetId, 'ApplyFeatureFlagPayload', data, subOptions)
  }

  return {
    featureFlagId,
    userIds,
    teamIds,
    orgIds
  }
}

export default applyFeatureFlag
