import {GraphQLResolveInfo} from 'graphql'
import {OAuth2IntegrationServerManager} from '../IntegrationServerManager'
import {
  IntegrationProvider,
  isOAuth2ProviderMetadata
} from '../../postgres/types/IntegrationProvider'
import {GetProfileQuery} from '../../types/gitlabTypes'
import {GitLabRequest} from '../../graphql/rootSchema'
import getProfile from '../../graphql/nestedSchema/GitLab/queries/getProfile.graphql'

class GitLabServerManager implements OAuth2IntegrationServerManager {
  readonly provider: IntegrationProvider
  readonly accessToken: string
  readonly serverBaseUrl: string

  constructor(provider: IntegrationProvider, accessToken: string) {
    const {providerMetadata} = provider
    if (!isOAuth2ProviderMetadata(providerMetadata)) {
      throw Error('Cannot instantiate GitLab with non OAuth2 metadata!')
    }

    this.provider = provider
    this.accessToken = accessToken
    this.serverBaseUrl = providerMetadata.serverBaseUrl
  }

  getGitLabRequest(info: GraphQLResolveInfo, batchRef: Record<any, any>) {
    const {schema} = info
    const composedRequest = (schema as any).gitlabRequest as GitLabRequest
    return async <TData = any, TVars = any>(query: string, variables: TVars) => {
      const result = await composedRequest<TData, TVars>({
        query,
        variables,
        info,
        endpointContext: {
          accessToken: this.accessToken,
          baseUri: this.serverBaseUrl
        },
        batchRef
      })
      const {data, errors} = result
      const error = errors ? new Error(errors[0].message) : null
      return [data, error] as [TData, typeof error]
    }
  }

  async isTokenValid(
    info: GraphQLResolveInfo,
    context: Record<any, any>
  ): Promise<[boolean, Error | null]> {
    if (!this.accessToken) return [false, new Error('GitLabServerManager has no access token')]

    const gitLabRequest = this.getGitLabRequest(info, context)
    const [, error] = await gitLabRequest<GetProfileQuery>(getProfile, {})
    if (error) return [false, error]

    return [true, null]
  }
}

export default GitLabServerManager
