import {GraphQLError} from 'graphql'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import JiraServerOAuth1Manager from '../../../integrations/jiraServer/JiraServerOAuth1Manager'
import type {MutationResolvers} from '../resolverTypes'

const createOAuth1AuthorizeUrl: MutationResolvers['createOAuth1AuthorizeUrl'] = async (
  _source,
  {providerId, teamId},
  {dataLoader}
) => {
  const providerDbId = IntegrationProviderId.split(providerId)
  const provider = Number.isInteger(providerDbId)
    ? await dataLoader.get('integrationProviders').load(providerDbId)
    : undefined
  if (!provider || provider.authStrategy !== 'oauth1') {
    throw new GraphQLError('Integration provider not found', {extensions: {code: 'NOT_FOUND'}})
  }
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const teamProviders = await dataLoader
    .get('sharedIntegrationProviders')
    .load({service: provider.service, orgIds: [team.orgId], teamIds: [teamId]})
  if (!teamProviders.some(({id}) => id === providerDbId)) {
    throw new GraphQLError('Provider is not available to this team', {
      extensions: {code: 'FORBIDDEN'}
    })
  }

  if (provider.service === 'jiraServer') {
    const manager = new JiraServerOAuth1Manager(
      provider.serverBaseUrl,
      provider.consumerKey,
      provider.consumerSecret
    )
    const url = await manager.requestToken()

    if (url instanceof Error) {
      throw new GraphQLError(url.message, {extensions: {code: 'SERVICE_UNAVAILABLE'}})
    }
    return {
      url
    }
  }
  throw new GraphQLError('Service not supported', {extensions: {code: 'BAD_USER_INPUT'}})
}

export default createOAuth1AuthorizeUrl
