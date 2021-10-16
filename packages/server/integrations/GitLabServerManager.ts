import {GraphQLResolveInfo} from 'graphql'
import {TaskIntegrationServerManager} from './IntegrationServerManager'
import {IntegrationProvider} from '../types/IntegrationProviderAndTokenT'
import {GetProfileQuery} from '../types/gitlabTypes'
import {GitLabRequest} from '../graphql/rootSchema'
import getProfile from '../graphql/nestedSchema/GitLab/queries/getProfile.graphql'

class GitLabServerManager extends TaskIntegrationServerManager {
  constructor(provider: IntegrationProvider) {
    super(provider)
  }

  getGitLabRequest(info: GraphQLResolveInfo, batchRef: Record<any, any>) {
    const {schema} = info
    const composedRequest = (schema as any).gitlabRequest as GitLabRequest
    const gitLabRequest = async <TData = any, TVars = any>(query: string, variables: TVars) => {
      const result = await composedRequest<TData, TVars>({
        query,
        variables,
        info,
        endpointContext: {
          accessToken: this.token?.accessToken,
          baseUri: this.provider.serverBaseUri
        },
        batchRef
      })
      const {data, errors} = result
      const error = errors ? new Error(errors[0].message) : null
      return [data, error] as [TData, typeof error]
    }

    return gitLabRequest
  }

  async isTokenValid(
    info: GraphQLResolveInfo,
    context: Record<any, any>
  ): Promise<[boolean, Error | null]> {
    const {accessToken} = this.token!
    if (!accessToken) return [false, new Error('GitLabServerManager has no access token')]

    const gitLabRequest = this.getGitLabRequest(info, context)
    const [, error] = await gitLabRequest<GetProfileQuery>(getProfile, {})
    if (error) return [false, error]

    return [true, null]
  }
}

export default GitLabServerManager
