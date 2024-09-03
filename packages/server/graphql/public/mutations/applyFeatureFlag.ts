import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import getUsersByDomain from '../../../postgres/queries/getUsersByDomain'
import {getUsersByEmails} from '../../../postgres/queries/getUsersByEmails'
import {getUserId, isSuperUser} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

interface Subjects {
  emails?: string[]
  domain?: string
  userId?: string
  teamId?: string
  orgId?: string
}

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
  const subjectKeys = Object.keys(subjects) as (keyof Subjects)[]
  if (subjectKeys.length !== 1) {
    return standardError(new Error('Exactly one subject type must be provided'), {
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
  let targetIds: string[] = []

  const [subjectType] = subjectKeys
  if (!subjectType) {
    return standardError(new Error('Subject value must be provided'), {userId: viewerId})
  }
  const subjectValue = subjects[subjectType]

  switch (subjectType) {
    case 'emails':
      const users = await getUsersByEmails(subjectValue as string[])
      targetIds = users.map((user) => user.id)
      break
    case 'domain':
      const domainUsers = await getUsersByDomain(subjectValue as string)
      targetIds = domainUsers.map((user) => user.id)
      break
    case 'userId':
    case 'teamId':
    case 'orgId':
      targetIds = [subjectValue as string]
      break
  }

  // Validate scope
  if (
    (subjectType === 'emails' || subjectType === 'domain' || subjectType === 'userId') &&
    scope !== 'User'
  ) {
    return standardError(
      new Error(`Scope mismatch: Feature flag is not for ${subjectType} scope`),
      {userId: viewerId}
    )
  }
  if (subjectType === 'teamId' && scope !== 'Team') {
    return standardError(new Error('Scope mismatch: Feature flag is not for Team scope'), {
      userId: viewerId
    })
  }
  if (subjectType === 'orgId' && scope !== 'Organization') {
    return standardError(new Error('Scope mismatch: Feature flag is not for Organization scope'), {
      userId: viewerId
    })
  }

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
    // TOOD: notification or viewer sub?
    publish(SubscriptionChannel.NOTIFICATION, targetId, 'ApplyFeatureFlagPayload', data, subOptions)
  }

  return {featureFlagId, targetIds}
}

export default applyFeatureFlag
