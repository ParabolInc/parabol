import {GraphQLResolveInfo} from 'graphql'
import {GQLContext} from '../../graphql/graphql'
import createIssueMutation from '../../graphql/nestedSchema/GitLab/mutations/createIssue.graphql'
import createNote from '../../graphql/nestedSchema/GitLab/mutations/createNote.graphql'
import getProfile from '../../graphql/nestedSchema/GitLab/queries/getProfile.graphql'
import getProjects from '../../graphql/nestedSchema/GitLab/queries/getProjects.graphql'
import {RootSchema} from '../../graphql/public/rootSchema'
import {IGetTeamMemberIntegrationAuthQueryResult} from '../../postgres/queries/generated/getTeamMemberIntegrationAuthQuery'
import {
  CreateIssueMutation,
  CreateNoteMutation,
  GetProfileQuery,
  GetProjectsQuery
} from '../../types/gitlabTypes'
import {TaskIntegrationManager} from '../TaskIntegrationManagerFactory'

class GitLabServerManager implements TaskIntegrationManager {
  public title = 'GitLab'
  private readonly auth: IGetTeamMemberIntegrationAuthQueryResult
  private readonly context: GQLContext
  private readonly info: GraphQLResolveInfo
  private readonly serverBaseUrl: string

  constructor(
    auth: IGetTeamMemberIntegrationAuthQueryResult,
    context: GQLContext,
    info: GraphQLResolveInfo,
    serverBaseUrl: string
  ) {
    this.serverBaseUrl = serverBaseUrl
    this.auth = auth
    this.context = context
    this.info = info
  }

  addCreatedBySomeoneElseComment(): Promise<string | Error> {
    throw new Error('Method not implemented yet.')
  }

  getGitLabRequest(info: GraphQLResolveInfo, batchRef: Record<any, any>) {
    const {schema} = info
    const composedRequest = (schema as RootSchema).gitlabRequest
    return async <TData = any, TVars = any>(query: string, variables: TVars) => {
      const result = await composedRequest<TData, TVars>({
        query,
        variables,
        info,
        endpointContext: {
          accessToken: this.auth.accessToken,
          baseUri: this.serverBaseUrl
        },
        batchRef
      })
      const {data, errors} = result
      const error = errors ? new Error(errors[0]?.message) : null
      return [data, error] as [TData, typeof error]
    }
  }

  async createTask({
    rawContentStr,
    integrationRepoId
  }: {
    rawContentStr: string
    integrationRepoId: string
  }) {
    return null
    // }): Promise<CreateTaskResponse> {
    // const {repoOwner, repoName} = GitHubRepoId.split(integrationRepoId)
    // const res = await createGitHubTask(
    //   rawContentStr,
    //   repoOwner,
    //   repoName,
    //   this.auth,
    //   this.context,
    //   this.info
    // )
    // if (res.error) return res.error
    // const {issueNumber, issueId} = res
    // return {
    //   integrationHash: GitHubIssueId.join(integrationRepoId, issueNumber),
    //   issueId,
    //   integration: {
    //     accessUserId: this.auth.userId,
    //     service: 'github',
    //     issueNumber,
    //     nameWithOwner: integrationRepoId
    //   }
    // }
  }

  async createIssue({
    title,
    description,
    projectPath
  }: {
    title: string
    description: string
    projectPath: string
  }) {
    // }): [CreateIssueMutation, Error | null] {
    const gitlabRequest = this.getGitLabRequest(this.info, this.context)
    // const [createIssueData, createIssueError] = await gitlabRequest<CreateIssueMutation>(
    const [createIssueData, createIssueError] = await gitlabRequest<CreateIssueMutation>(
      createIssueMutation,
      {
        input: {
          title,
          description,
          projectPath
        }
      }
    )
    return [createIssueData, createIssueError] as const
    // if (createIssueError) return createIssueError
    // const issue = createIssueData.createIssue?.issue
    // if (!issue) return new Error('GitLab create issue failed')
    // const {id: gid} = issue
    // const providerId = `${this.auth.providerId}`
    // return {
    //   integrationHash: GitLabIssueId.join(`${providerId}`, gid),
    //   issueId: gid,
    //   integration: {
    //     accessUserId: this.auth.userId,
    //     service: 'gitlab',
    //     providerId,
    //     gid
    //   }
    // }
  }

  // gitlab refers to comments in issues as notes
  async createNote({body, noteableId}: {body: string; noteableId: string}) {
    const gitlabRequest = this.getGitLabRequest(this.info, this.context)
    // const [noteData, noteError] = await gitlabRequest<CreateNotePayload>(createNote, {
    const [noteData, noteError] = await gitlabRequest<CreateNoteMutation>(createNote, {
      input: {body, noteableId}
    })
    return [noteData, noteError] as const
  }

  async getProjects({teamId}: {teamId: string}) {
    const gitlabRequest = this.getGitLabRequest(this.info, this.context)
    const [projectsData, projectsError] = await gitlabRequest<GetProjectsQuery>(getProjects, {
      teamId
    })
    return [projectsData, projectsError] as const
  }

  async isTokenValid(
    info: GraphQLResolveInfo,
    context: Record<any, any>
  ): Promise<[boolean, Error | null]> {
    if (!this.auth.accessToken) return [false, new Error('GitLabServerManager has no access token')]

    const gitlabRequest = this.getGitLabRequest(info, context)
    const [, error] = await gitlabRequest<GetProfileQuery>(getProfile, {})
    if (error) return [false, error]

    return [true, null]
  }
}

export default GitLabServerManager
