import {GraphQLResolveInfo} from 'graphql'
import getProfile from '../../graphql/nestedSchema/GitLab/queries/getProfile.graphql'
import {GitLabRequest} from '../../graphql/public/rootSchema'
import {IntegrationProviderGitLabOAuth2} from '../../postgres/queries/getIntegrationProvidersByIds'
import {GetProfileQuery} from '../../types/gitlabTypes'

class GitLabServerManager {
  readonly provider: IntegrationProviderGitLabOAuth2
  readonly accessToken: string
  readonly serverBaseUrl: string

  constructor(accessToken: string, serverBaseUrl: string) {
    this.accessToken = accessToken
    this.serverBaseUrl = serverBaseUrl
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
