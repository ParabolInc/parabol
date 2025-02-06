import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isSuperUser, isTeamMember, isUserOrgAdmin} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import {MSTeamsNotifier} from '../../mutations/helpers/notifications/MSTeamsNotifier'
import {MattermostNotifier} from '../../mutations/helpers/notifications/MattermostNotifier'
import {MutationResolvers} from '../resolverTypes'

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
  const currentProvider = await pg
    .selectFrom('IntegrationProvider')
    .selectAll()
    .where('id', '=', providerDbId)
    .executeTakeFirst()
  if (!currentProvider) {
    return {error: {message: 'Invalid provider ID'}}
  }
  const {teamId: oldTeamId, orgId: oldOrgId, scope: oldScope, authStrategy} = currentProvider

  const [oldTeam, newTeam] = await Promise.all([
    oldTeamId ? dataLoader.get('teams').load(oldTeamId) : null,
    newTeamId ? dataLoader.get('teams').load(newTeamId) : null
  ])

  if (newScope === 'global' && (newTeamId || newOrgId)) {
    return {error: {message: 'Global providers must not have an `orgId` nor `teamId`'}}
  }
  if (newScope === 'org' && (!newOrgId || newTeamId)) {
    return {error: {message: 'Organization providers must have an `orgId` and no `teamId`'}}
  }
  if (newScope === 'team' && !newTeamId) {
    return {error: {message: 'Team providers must have a `teamId`'}}
  }

  // AUTH
  if (!isSuperUser(authToken)) {
    if (oldScope === 'global' || newScope === 'global') {
      return {error: {message: 'Must be a super user to add a global provider'}}
    }
    if (
      (oldScope === 'org' && !(await isUserOrgAdmin(viewerId, oldOrgId!, dataLoader))) ||
      (newScope === 'org' && !(await isUserOrgAdmin(viewerId, newOrgId!, dataLoader)))
    ) {
      return {
        error: {
          message:
            'Must be an organization admin to add an integration provider on organization level'
        }
      }
    }
    if (
      (oldScope === 'team' &&
        !isTeamMember(authToken, oldTeamId!) &&
        !(await isUserOrgAdmin(viewerId, oldTeam!.orgId, dataLoader))) ||
      (newScope === 'team' &&
        !isTeamMember(authToken, newTeamId!) &&
        !(await isUserOrgAdmin(viewerId, newTeam!.orgId, dataLoader)))
    ) {
      return {error: {message: 'Must be on the team for the integration provider'}}
    }
  }

  // VALIDATION
  if (oAuth2ProviderMetadataInput && webhookProviderMetadataInput) {
    return {error: {message: 'Provided 2 metadata types, expected 1'}}
  }
  if (authStrategy === 'webhook') {
    if (!webhookProviderMetadataInput) {
      return {error: {message: 'Expected webhook metadata'}}
    }
  } else if (authStrategy === 'oauth2') {
    if (!oAuth2ProviderMetadataInput) {
      return {error: {message: 'Expected OAuth2 metadata'}}
    }
  } else {
    return {error: {message: 'Unsupported authStrategy'}}
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
