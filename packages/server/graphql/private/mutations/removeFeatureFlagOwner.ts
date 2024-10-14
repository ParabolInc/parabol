import getKysely from '../../../postgres/getKysely'
import getUsersByDomain from '../../../postgres/queries/getUsersByDomain'
import {getUsersByEmails} from '../../../postgres/queries/getUsersByEmails'
import {getUserId} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const removeFeatureFlagOwner: MutationResolvers['removeFeatureFlagOwner'] = async (
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

  if (scope === 'User') {
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
  } else if (scope === 'Team') {
    if (subjects.teamIds) {
      teamIds.push(...subjects.teamIds)
    }
  } else if (scope === 'Organization') {
    if (subjects.orgIds) {
      orgIds.push(...subjects.orgIds)
    }
  }

  let deletedCount = 0

  if (scope === 'User' && userIds.length > 0) {
    const result = await pg
      .deleteFrom('FeatureFlagOwner')
      .where('featureFlagId', '=', featureFlagId)
      .where('userId', 'in', userIds)
      .executeTakeFirst()
    deletedCount = Number(result?.numDeletedRows ?? 0)
  } else if (scope === 'Team' && teamIds.length > 0) {
    const result = await pg
      .deleteFrom('FeatureFlagOwner')
      .where('featureFlagId', '=', featureFlagId)
      .where('teamId', 'in', teamIds)
      .executeTakeFirst()
    deletedCount = Number(result?.numDeletedRows ?? 0)
  } else if (scope === 'Organization' && orgIds.length > 0) {
    const result = await pg
      .deleteFrom('FeatureFlagOwner')
      .where('featureFlagId', '=', featureFlagId)
      .where('orgId', 'in', orgIds)
      .executeTakeFirst()
    deletedCount = Number(result?.numDeletedRows ?? 0)
  }

  if (deletedCount === 0) {
    return standardError(
      new Error('No feature flag owners were removed. Check the scope and subjects provided.')
    )
  }

  return {
    featureFlagId,
    removedCount: deletedCount,
    userIds: scope === 'User' ? userIds : null,
    teamIds: scope === 'Team' ? teamIds : null,
    orgIds: scope === 'Organization' ? orgIds : null
  }
}

export default removeFeatureFlagOwner
