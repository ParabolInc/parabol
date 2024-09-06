import getKysely from '../../../postgres/getKysely'
import getUsersByDomain from '../../../postgres/queries/getUsersByDomain'
import {getUsersByEmails} from '../../../postgres/queries/getUsersByEmails'
import {getUserId} from '../../../utils/authorization'
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

  const viewerId = getUserId(authToken)

  const subjectKeys = Object.keys(subjects)

  if (subjectKeys.length === 0) {
    return standardError(new Error('At least one subject type must be provided'), {
      userId: viewerId
    })
  }

  const featureFlag = await pg
    .selectFrom('FeatureFlag')
    .select(['id'])
    .where('featureName', '=', flagName)
    .executeTakeFirst()

  if (!featureFlag) {
    return standardError(new Error('Feature flag not found'), {userId: viewerId})
  }

  const {id: featureFlagId} = featureFlag

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

  const targetIds = [...userIds, ...teamIds, ...orgIds]

  const values = targetIds.map((targetId) => ({
    featureFlagId,
    userId: userIds.includes(targetId) ? targetId : null,
    teamId: teamIds.includes(targetId) ? targetId : null,
    orgId: orgIds.includes(targetId) ? targetId : null
  }))

  await pg
    .insertInto('FeatureFlagOwner')
    .values(values)
    .onConflict((oc) => oc.doNothing())
    .execute()

  return {
    featureFlagId,
    userIds,
    teamIds,
    orgIds
  }
}

export default applyFeatureFlag
