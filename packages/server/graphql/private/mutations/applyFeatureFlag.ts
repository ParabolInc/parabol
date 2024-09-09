import getKysely from '../../../postgres/getKysely'
import getUsersByDomain from '../../../postgres/queries/getUsersByDomain'
import {getUsersByEmails} from '../../../postgres/queries/getUsersByEmails'
import {getUserId} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const applyFeatureFlag: MutationResolvers['applyFeatureFlag'] = async (
  _source,
  {flagName, subjects},
  {authToken}
) => {
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

  if (subjects.emails) {
    const users = await getUsersByEmails(subjects.emails)
    userIds.push(...users.map((user) => user.id))
  }

  if (subjects.domains) {
    for (const domain of subjects.domains) {
      const domainUsers = await getUsersByDomain(domain)
      userIds.push(...domainUsers.map((user) => user.id))
    }
  }

  if (subjects.userIds) {
    userIds.push(...subjects.userIds)
  }

  if (subjects.teamIds) {
    teamIds.push(...subjects.teamIds)
  }

  if (subjects.orgIds) {
    orgIds.push(...subjects.orgIds)
  }

  const values = [
    ...userIds.map((userId) => ({userId, featureFlagId})),
    ...teamIds.map((teamId) => ({teamId, featureFlagId})),
    ...orgIds.map((orgId) => ({orgId, featureFlagId}))
  ]

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
