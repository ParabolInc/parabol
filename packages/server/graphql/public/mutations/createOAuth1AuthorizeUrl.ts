import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import JiraServerOAuth1Manager from '../../../integrations/jiraServer/JiraServerOAuth1Manager'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const createOAuth1AuthorizeUrl: MutationResolvers['createOAuth1AuthorizeUrl'] = async (
  _source,
  {providerId, teamId},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {
      userId: viewerId,
      tags: {teamId}
    })
  }

  const provider = await dataLoader
    .get('integrationProviders')
    .load(IntegrationProviderId.split(providerId))
  if (!provider || provider.authStrategy !== 'oauth1') {
    return standardError(new Error('Integration provider not found'), {
      userId: viewerId,
      tags: {providerId}
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
