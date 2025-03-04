import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {isNotNull} from 'parabol-client/utils/predicates'
import upsertIntegrationProvider from '../../../postgres/queries/upsertIntegrationProvider'
import {getUserId, isSuperUser, isTeamMember, isUserOrgAdmin} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import {MutationResolvers} from '../resolverTypes'

const addIntegrationProvider: MutationResolvers['addIntegrationProvider'] = async (
  _source,
  {input},
  context
) => {
  const {authToken, dataLoader, socketId: mutatorId} = context
  const {teamId, orgId, scope, service} = input
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // INPUT VALIDATION
  if (service === 'jira' || service === 'github') {
    return {error: {message: 'Service is not supported'}}
  }
  if (scope === 'global' && (teamId || orgId)) {
    return {error: {message: 'Global providers must not have an `orgId` nor `teamId`'}}
  }
  if (scope === 'org' && (!orgId || teamId)) {
    return {error: {message: 'Org providers must have an `orgId` and no `teamId`'}}
  }
  if (scope === 'team' && (!teamId || orgId)) {
    return {error: {message: 'Team providers must have a `teamId` and no `orgId`'}}
  }

  // AUTH
  if (!isSuperUser(authToken)) {
    if (scope === 'global') {
      return {error: {message: 'Must be a super user to add a global provider'}}
    }
    if (scope === 'org' && !(await isUserOrgAdmin(viewerId, orgId!, dataLoader))) {
      return {
        error: {
          message:
            'Must be an organization admin to add an integration provider on organization level'
        }
      }
    }
    if (scope === 'team' && !isTeamMember(authToken, teamId!)) {
      return {error: {message: 'Must be on the team for the integration provider'}}
    }
  }

  // VALIDATION
  const {
    authStrategy,
    oAuth1ProviderMetadataInput,
    oAuth2ProviderMetadataInput,
    webhookProviderMetadataInput,
    sharedSecretMetadataInput,
    ...rest
  } = input

  if (authStrategy === 'oauth1' && !oAuth1ProviderMetadataInput) {
    return {error: {message: 'Auth strategy oauth1 requires oAuth1ProviderMetadataInput'}}
  }
  if (authStrategy === 'oauth2' && !oAuth2ProviderMetadataInput) {
    return {error: {message: 'Auth strategy oauth2 requires oAuth2ProviderMetadataInput'}}
  }
  if (authStrategy === 'webhook' && !webhookProviderMetadataInput) {
    return {error: {message: 'Auth strategy webhook requires webhookProviderMetadataInput'}}
  }
  if (
    [
      oAuth1ProviderMetadataInput,
      oAuth2ProviderMetadataInput,
      webhookProviderMetadataInput,
      sharedSecretMetadataInput
    ].filter(isNotNull).length !== 1
  ) {
    return {error: {message: 'Exactly 1 metadata provider is expected'}}
  }

  // RESOLUTION
  const providerId = await upsertIntegrationProvider({
    authStrategy,
    ...rest,
    service,
    ...oAuth1ProviderMetadataInput,
    ...oAuth2ProviderMetadataInput,
    ...webhookProviderMetadataInput,
    ...sharedSecretMetadataInput,
    ...(scope === 'global'
      ? {orgId: null, teamId: null}
      : scope === 'org'
        ? {orgId: orgId!, teamId: null}
        : {orgId: null, teamId: teamId!})
  })

  const data = {
    providerId,
    orgId: orgId || undefined,
    teamId: teamId || undefined
  }
  if (orgId) {
    publish(
      SubscriptionChannel.ORGANIZATION,
      orgId,
      'AddIntegrationProviderSuccess',
      data,
      subOptions
    )
  }
  return data
}

export default addIntegrationProvider
