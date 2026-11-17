import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {isNotNull} from 'parabol-client/utils/predicates'
import upsertIntegrationProvider from '../../../postgres/queries/upsertIntegrationProvider'
import {getUserId, isSuperUser, isTeamMember, isUserOrgAdmin} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

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
  if (scope === 'global' && (teamId || orgId)) {
    throw new GraphQLError('Global providers must not have an `orgId` nor `teamId`', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (scope === 'org' && (!orgId || teamId)) {
    throw new GraphQLError('Org providers must have an `orgId` and no `teamId`', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (scope === 'team' && (!teamId || orgId)) {
    throw new GraphQLError('Team providers must have a `teamId` and no `orgId`', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }

  // AUTH
  if (!isSuperUser(authToken)) {
    if (scope === 'global') {
      throw new GraphQLError('Must be a super user to add a global provider', {
        extensions: {code: 'FORBIDDEN'}
      })
    }
    if (scope === 'org' && !(await isUserOrgAdmin(viewerId, orgId!, dataLoader))) {
      throw new GraphQLError(
        'Must be an organization admin to add an integration provider on organization level',
        {extensions: {code: 'FORBIDDEN'}}
      )
    }
    if (scope === 'team' && !isTeamMember(authToken, teamId!)) {
      throw new GraphQLError('Must be on the team for the integration provider', {
        extensions: {code: 'FORBIDDEN'}
      })
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
    throw new GraphQLError('Auth strategy oauth1 requires oAuth1ProviderMetadataInput', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (authStrategy === 'oauth2' && !oAuth2ProviderMetadataInput) {
    throw new GraphQLError('Auth strategy oauth2 requires oAuth2ProviderMetadataInput', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (authStrategy === 'webhook' && !webhookProviderMetadataInput) {
    throw new GraphQLError('Auth strategy webhook requires webhookProviderMetadataInput', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (
    [
      oAuth1ProviderMetadataInput,
      oAuth2ProviderMetadataInput,
      webhookProviderMetadataInput,
      sharedSecretMetadataInput
    ].filter(isNotNull).length !== 1
  ) {
    throw new GraphQLError('Exactly 1 metadata provider is expected', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
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
