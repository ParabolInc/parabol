import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import publish from '../../../utils/publish'
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

  const ownerId = (orgId || teamId || userId) as string

  if (orgId && !(await isUserOrgAdmin(viewerId, orgId, dataLoader))) {
    return standardError(new Error('Not organization admin'))
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
    .selectAll()
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

  const operationId = dataLoader.share()
  const subOptions = {operationId}
  const isEnabled = !!existingOwner

  if (isEnabled) {
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
  }
  const data = {
    featureFlagId: featureFlag.id,
    enabled: !isEnabled
  }
  publish(SubscriptionChannel.NOTIFICATION, ownerId, 'ToggleFeatureFlagPayload', data, subOptions)
  return data
}

export default toggleFeatureFlag
