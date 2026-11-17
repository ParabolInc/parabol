import {GraphQLError} from 'graphql'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isSuperUser, isTeamMember, isUserOrgAdmin} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import {MattermostNotifier} from '../../mutations/helpers/notifications/MattermostNotifier'
import {MSTeamsNotifier} from '../../mutations/helpers/notifications/MSTeamsNotifier'
import type {MutationResolvers} from '../resolverTypes'

const updateIntegrationProvider: MutationResolvers['updateIntegrationProvider'] = async (
  _source,
  {provider},
  context
) => {
  const {authToken, dataLoader, socketId: mutatorId} = context
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const pg = getKysely()

  const {
    id: providerId,
    webhookProviderMetadataInput,
    oAuth2ProviderMetadataInput,
    scope: newScope,
    teamId: newTeamId,
    orgId: newOrgId
  } = provider

  // INPUT VALIDATION
  const providerDbId = IntegrationProviderId.split(providerId)
  if (!Number.isInteger(providerDbId)) {
    throw new GraphQLError('Invalid provider ID', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  const currentProvider = await pg
    .selectFrom('IntegrationProvider')
    .selectAll()
    .where('id', '=', providerDbId)
    .executeTakeFirst()
  if (!currentProvider) {
    throw new GraphQLError('Invalid provider ID', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  const {teamId: oldTeamId, orgId: oldOrgId, scope: oldScope, authStrategy} = currentProvider

  const [oldTeam, newTeam] = await Promise.all([
    oldTeamId ? dataLoader.get('teams').load(oldTeamId) : null,
    newTeamId ? dataLoader.get('teams').load(newTeamId) : null
  ])

  if (newScope === 'global' && (newTeamId || newOrgId)) {
    throw new GraphQLError('Global providers must not have an `orgId` nor `teamId`', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (newScope === 'org' && (!newOrgId || newTeamId)) {
    throw new GraphQLError('Organization providers must have an `orgId` and no `teamId`', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (newScope === 'team' && !newTeamId) {
    throw new GraphQLError('Team providers must have a `teamId`', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }

  // AUTH
  if (!isSuperUser(authToken)) {
    if (oldScope === 'global' || newScope === 'global') {
      throw new GraphQLError('Must be a super user to add a global provider', {
        extensions: {code: 'FORBIDDEN'}
      })
    }
    if (
      (oldScope === 'org' && !(await isUserOrgAdmin(viewerId, oldOrgId!, dataLoader))) ||
      (newScope === 'org' && !(await isUserOrgAdmin(viewerId, newOrgId!, dataLoader)))
    ) {
      throw new GraphQLError(
        'Must be an organization admin to add an integration provider on organization level',
        {extensions: {code: 'FORBIDDEN'}}
      )
    }
    if (
      (oldScope === 'team' &&
        !isTeamMember(authToken, oldTeamId!) &&
        !(await isUserOrgAdmin(viewerId, oldTeam!.orgId, dataLoader))) ||
      (newScope === 'team' &&
        !isTeamMember(authToken, newTeamId!) &&
        !(await isUserOrgAdmin(viewerId, newTeam!.orgId, dataLoader)))
    ) {
      throw new GraphQLError('Must be on the team for the integration provider', {
        extensions: {code: 'FORBIDDEN'}
      })
    }
  }
  if (context.resourceGrants) {
    const orgIds = [
      oldScope === 'org' ? oldOrgId : null,
      newScope === 'org' ? newOrgId : null
    ].filter(Boolean) as string[]
    const teamIds = [
      oldScope === 'team' ? oldTeamId : null,
      newScope === 'team' ? newTeamId : null
    ].filter(Boolean) as string[]
    const [orgAccess, teamAccess] = await Promise.all([
      Promise.all(orgIds.map((id) => context.resourceGrants!.hasOrg(id))),
      Promise.all(teamIds.map((id) => context.resourceGrants!.hasTeam(id)))
    ])
    if (orgAccess.some((v) => !v)) {
      throw new GraphQLError('PAT does not grant access to this organization', {
        extensions: {code: 'FORBIDDEN'}
      })
    }
    if (teamAccess.some((v) => !v)) {
      throw new GraphQLError('PAT does not grant access to this team', {
        extensions: {code: 'FORBIDDEN'}
      })
    }
  }

  // VALIDATION
  if (oAuth2ProviderMetadataInput && webhookProviderMetadataInput) {
    throw new GraphQLError('Provided 2 metadata types, expected 1', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (authStrategy === 'webhook') {
    if (!webhookProviderMetadataInput) {
      throw new GraphQLError('Expected webhook metadata', {extensions: {code: 'BAD_USER_INPUT'}})
    }
  } else if (authStrategy === 'oauth2') {
    if (!oAuth2ProviderMetadataInput) {
      throw new GraphQLError('Expected OAuth2 metadata', {extensions: {code: 'BAD_USER_INPUT'}})
    }
  } else {
    throw new GraphQLError('Unsupported authStrategy', {extensions: {code: 'BAD_USER_INPUT'}})
  }

  const teamId = newTeamId || oldTeamId
  const orgId = newOrgId || oldOrgId
  const scope = newScope ?? oldScope

  // RESOLUTION
  await pg
    .updateTable('IntegrationProvider')
    .set({
      ...oAuth2ProviderMetadataInput,
      ...webhookProviderMetadataInput,
      scope,
      ...(scope === 'global'
        ? {orgId: null, teamId: null}
        : scope === 'org'
          ? {orgId, teamId: null}
          : {orgId: null, teamId})
    })
    .where('id', '=', providerDbId)
    .execute()
  if (currentProvider.service === 'mattermost') {
    const {webhookUrl} = currentProvider
    const newWebhookUrl = webhookProviderMetadataInput?.webhookUrl
    if (teamId && newWebhookUrl && newWebhookUrl !== webhookUrl) {
      Object.assign(currentProvider, webhookProviderMetadataInput)
      await MattermostNotifier.integrationUpdated(dataLoader, teamId, viewerId)
    }
  }
  if (currentProvider.service === 'msTeams') {
    const {webhookUrl} = currentProvider
    const newWebhookUrl = webhookProviderMetadataInput?.webhookUrl
    if (teamId && newWebhookUrl && newWebhookUrl !== webhookUrl) {
      Object.assign(currentProvider, webhookProviderMetadataInput)
      await MSTeamsNotifier.integrationUpdated(dataLoader, teamId, viewerId)
    }
  }
  const data = {userId: viewerId, providerId: providerDbId}
  if (orgId) {
    publish(
      SubscriptionChannel.ORGANIZATION,
      orgId,
      'UpdateIntegrationProviderSuccess',
      data,
      subOptions
    )
  }
  return data
}

export default updateIntegrationProvider
