import {GraphQLError} from 'graphql'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isSuperUser, isTeamMember, isUserOrgAdmin} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const removeIntegrationProvider: MutationResolvers['removeIntegrationProvider'] = async (
  _source,
  {providerId},
  context
) => {
  const {authToken, dataLoader, socketId: mutatorId} = context
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const providerDbId = IntegrationProviderId.split(providerId)
  if (!Number.isInteger(providerDbId)) {
    throw new GraphQLError('Integration Provider not found', {extensions: {code: 'NOT_FOUND'}})
  }
  const provider = await dataLoader.get('integrationProviders').load(providerDbId)
  if (!provider)
    throw new GraphQLError('Integration Provider not found', {extensions: {code: 'NOT_FOUND'}})
  const {teamId, orgId, scope} = provider

  if (!isSuperUser(authToken)) {
    if (scope === 'global') {
      throw new GraphQLError('Must be a super user to remove a global provider', {
        extensions: {code: 'FORBIDDEN'}
      })
    }
    if (scope === 'org' && !(await isUserOrgAdmin(viewerId, orgId!, dataLoader))) {
      throw new GraphQLError('Must be a member of the organization that created the provider', {
        extensions: {code: 'FORBIDDEN'}
      })
    }
    if (scope === 'team' && !isTeamMember(authToken, teamId!)) {
      const team = await dataLoader.get('teams').load(teamId!)
      if (!team || !(await isUserOrgAdmin(viewerId, team.orgId, dataLoader))) {
        throw new GraphQLError('Must be on the team that created the provider', {
          extensions: {code: 'FORBIDDEN'}
        })
      }
    }
  }
  if (context.resourceGrants) {
    if (scope === 'org' && !(await context.resourceGrants.hasOrg(orgId!))) {
      throw new GraphQLError('PAT does not grant access to this organization', {
        extensions: {code: 'FORBIDDEN'}
      })
    } else if (scope === 'team' && !(await context.resourceGrants.hasTeam(teamId!))) {
      throw new GraphQLError('PAT does not grant access to this team', {
        extensions: {code: 'FORBIDDEN'}
      })
    }
  }

  // RESOLUTION
  await getKysely()
    .with('removedTokens', (eb) =>
      eb
        .updateTable('TeamMemberIntegrationAuth')
        .set({isActive: false})
        .where('providerId', '=', providerDbId)
        .where('isActive', '=', true)
    )
    .updateTable('IntegrationProvider')
    .set({isActive: false})
    .where('id', '=', providerDbId)
    .where('isActive', '=', true)
    .execute()

  const data = {
    providerId,
    orgIntegrationProviders: orgId ? {orgId} : null,
    teamMemberIntegrations: teamId ? {teamId, userId: viewerId} : null
  }

  if (orgId) {
    publish(
      SubscriptionChannel.ORGANIZATION,
      orgId,
      'RemoveIntegrationProviderSuccess',
      data,
      subOptions
    )
  }
  return data
}

export default removeIntegrationProvider
