import {GraphQLError} from 'graphql'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import JiraServerOAuth1Manager from '../../../integrations/jiraServer/JiraServerOAuth1Manager'
import {getUserId} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const createOAuth1AuthorizeUrl: MutationResolvers['createOAuth1AuthorizeUrl'] = async (
  _source,
  {providerId, teamId},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const providerDbId = IntegrationProviderId.split(providerId)
  const provider = Number.isInteger(providerDbId)
    ? await dataLoader.get('integrationProviders').load(providerDbId)
    : undefined
  if (!provider || provider.authStrategy !== 'oauth1') {
    return standardError(new Error('Integration provider not found'), {
      userId: viewerId,
      tags: {providerId}
    })
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
      return standardError(url)
    }
    return {
      url
    }
  }
  return standardError(new Error('Service not supported'), {
    tags: {service: (provider as any).service}
  })
}

export default createOAuth1AuthorizeUrl
