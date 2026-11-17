import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import {getFeatureFlag} from '../../../utils/featureFlags'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const toggleFeatureFlag: MutationResolvers['toggleFeatureFlag'] = async (
  _source,
  {featureName, orgId, teamId, userId},
  context
) => {
  const {authToken, dataLoader} = context
  const viewerId = getUserId(authToken)
  const pg = getKysely()

  if (!orgId && !teamId && !userId) {
    throw new GraphQLError('Must provide one an orgId, teamId, or userId', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }

  const ownerId = (orgId || teamId || userId) as string

  if (orgId && !(await isUserOrgAdmin(viewerId, orgId, dataLoader))) {
    throw new GraphQLError('Not organization admin', {extensions: {code: 'FORBIDDEN'}})
  }
  if (orgId && context.resourceGrants && !(await context.resourceGrants.hasOrg(orgId))) {
    throw new GraphQLError('PAT does not grant access to this organization', {
      extensions: {code: 'FORBIDDEN'}
    })
  }

  if (teamId) {
    const teamMemberId = toTeamMemberId(teamId, viewerId)
    const teamMember = await dataLoader.get('teamMembers').load(teamMemberId)
    if (!teamMember?.isNotRemoved) {
      throw new GraphQLError('Not a member of the team anymore', {extensions: {code: 'FORBIDDEN'}})
    }
    if (!teamMember) {
      throw new GraphQLError('Not a member of the team', {extensions: {code: 'FORBIDDEN'}})
    }
    if (!teamMember.isLead) {
      throw new GraphQLError('Not team lead', {extensions: {code: 'FORBIDDEN'}})
    }
    if (context.resourceGrants && !(await context.resourceGrants.hasTeam(teamId))) {
      throw new GraphQLError('PAT does not grant access to this team', {
        extensions: {code: 'FORBIDDEN'}
      })
    }
  }

  if (userId && userId !== viewerId) {
    throw new GraphQLError('Not the user', {extensions: {code: 'FORBIDDEN'}})
  }

  const featureFlag = getFeatureFlag(featureName)

  if (!featureFlag || featureFlag.expiresAt <= new Date()) {
    throw new GraphQLError('Feature flag not found or expired', {extensions: {code: 'NOT_FOUND'}})
  }
  if (!featureFlag.isPublic) {
    throw new GraphQLError('Contact love@parabol.co to enable this feature flag', {
      extensions: {code: 'FORBIDDEN'}
    })
  }

  const scope = orgId ? 'Organization' : teamId ? 'Team' : 'User'
  if (featureFlag.scope !== scope) {
    throw new GraphQLError(`Feature flag is ${featureFlag.scope}-scoped, not ${scope}-scoped`, {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }

  const existingOwner = await pg
    .selectFrom('FeatureFlagOwner')
    .selectAll()
    .where('featureName', '=', featureName)
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
      .where('featureName', '=', featureName)
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
        featureName,
        orgId: orgId || null,
        teamId: teamId || null,
        userId: userId || null
      })
      .execute()
  }
  const data = {
    featureName: featureFlag.featureName,
    enabled: !isEnabled
  }
  publish(SubscriptionChannel.NOTIFICATION, ownerId, 'ToggleFeatureFlagSuccess', data, subOptions)
  return data
}

export default toggleFeatureFlag
