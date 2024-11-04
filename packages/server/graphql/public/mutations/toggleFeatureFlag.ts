import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isUserBillingLeader, isUserOrgAdmin} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const toggleFeatureFlag: MutationResolvers['toggleFeatureFlag'] = async (
  _source,
  {featureName, orgId, teamId, userId},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const pg = getKysely()

  if (!orgId && !teamId && !userId) {
    return standardError(new Error('Must provide one an orgId, teamId, or userId'))
  }

  const ownerId = orgId || teamId || userId

  if (
    orgId &&
    !(await isUserOrgAdmin(viewerId, orgId, dataLoader)) &&
    !(await isUserBillingLeader(viewerId, orgId, dataLoader))
  ) {
    return standardError(new Error('Not organization admin or billing lead'))
  }

  if (teamId) {
    const teamMemberId = toTeamMemberId(teamId, viewerId)
    const teamMember = await dataLoader.get('teamMembers').load(teamMemberId)
    if (!teamMember) {
      return standardError(new Error('Not a member of the team'))
    }
    if (!teamMember.isLead) {
      return standardError(new Error('Not team lead'))
    }
  }

  if (userId && userId !== viewerId) {
    return standardError(new Error('Not the user'))
  }

  const featureFlag = await pg
    .selectFrom('FeatureFlag')
    .select(['id', 'scope'])
    .where('featureName', '=', featureName)
    .where('expiresAt', '>', new Date())
    .executeTakeFirst()

  if (!featureFlag) {
    return standardError(new Error('Feature flag not found or expired'))
  }

  const scope = orgId ? 'Organization' : teamId ? 'Team' : 'User'
  if (featureFlag.scope !== scope) {
    return standardError(
      new Error(`Feature flag is ${featureFlag.scope}-scoped, not ${scope}-scoped`)
    )
  }

  const existingOwner = await pg
    .selectFrom('FeatureFlagOwner')
    .selectAll()
    .where('featureFlagId', '=', featureFlag.id)
    .where((eb) =>
      eb.or([
        eb('orgId', '=', orgId || null),
        eb('teamId', '=', teamId || null),
        eb('userId', '=', userId || null)
      ])
    )
    .executeTakeFirst()

  if (existingOwner) {
    await pg
      .deleteFrom('FeatureFlagOwner')
      .where('featureFlagId', '=', featureFlag.id)
      .where((eb) =>
        eb.or([
          eb('orgId', '=', orgId || null),
          eb('teamId', '=', teamId || null),
          eb('userId', '=', userId || null)
        ])
      )
      .execute()
    return {ownerId, enabled: false}
  } else {
    await pg
      .insertInto('FeatureFlagOwner')
      .values({
        featureFlagId: featureFlag.id,
        orgId: orgId || null,
        teamId: teamId || null,
        userId: userId || null
      })
      .execute()
    return {ownerId, featureName}
  }
}

export default toggleFeatureFlag
