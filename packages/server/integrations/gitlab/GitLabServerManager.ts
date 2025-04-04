import {JSONContent} from '@tiptap/core'
import {GraphQLResolveInfo} from 'graphql'
import GitLabIssueId from 'parabol-client/shared/gqlIds/GitLabIssueId'
import {splitTipTapContent} from 'parabol-client/shared/tiptap/splitTipTapContent'
import {GQLContext} from '../../graphql/graphql'
import createIssueMutation from '../../graphql/nestedSchema/GitLab/mutations/createIssue.graphql'
import createLabel from '../../graphql/nestedSchema/GitLab/mutations/createLabel.graphql'
import createNote from '../../graphql/nestedSchema/GitLab/mutations/createNote.graphql'
import updateIssue from '../../graphql/nestedSchema/GitLab/mutations/updateIssue.graphql'
import getIssue from '../../graphql/nestedSchema/GitLab/queries/getIssue.graphql'
import getLabels from '../../graphql/nestedSchema/GitLab/queries/getLabels.graphql'
import getProfile from '../../graphql/nestedSchema/GitLab/queries/getProfile.graphql'
import getProjectIssues from '../../graphql/nestedSchema/GitLab/queries/getProjectIssues.graphql'
import getProjects from '../../graphql/nestedSchema/GitLab/queries/getProjects.graphql'
import {gitlabRequest} from '../../graphql/public/rootSchema'
import {TeamMemberIntegrationAuth} from '../../postgres/types'
import {
  CreateIssueMutation,
  CreateLabelMutation,
  CreateLabelMutationVariables,
  CreateNoteMutation,
  GetIssueQuery,
  GetLabelsQuery,
  GetProfileQuery,
  GetProjectIssuesQuery,
  GetProjectIssuesQueryVariables,
  GetProjectsQuery,
  UpdateIssueMutation,
  UpdateIssueMutationVariables
} from '../../types/gitlabTypes'
import {convertTipTapToMarkdown} from '../../utils/convertTipTapToMarkdown'
import makeCreateGitLabTaskComment from '../../utils/makeCreateGitLabTaskComment'
import {CreateTaskResponse, TaskIntegrationManager} from '../TaskIntegrationManagerFactory'

class GitLabServerManager implements TaskIntegrationManager {
  public title = 'GitLab'
  private readonly auth: TeamMemberIntegrationAuth
  private readonly context: GQLContext
  private readonly info: GraphQLResolveInfo
  private readonly serverBaseUrl: string

  constructor(
    auth: TeamMemberIntegrationAuth,
    context: GQLContext,
    info: GraphQLResolveInfo,
    serverBaseUrl: string
  ) {
    this.serverBaseUrl = serverBaseUrl
    this.auth = auth
    this.context = context
    this.info = info
  }

  getGitLabRequest(info: GraphQLResolveInfo, batchRef: Record<any, any>) {
    return async <TData = any, TVars = any>(query: string, variables: TVars) => {
      const result = await gitlabRequest<TData, TVars>({
        query,
        variables,
        info,
        endpointContext: {
          accessToken: this.auth.accessToken,
          baseUri: this.serverBaseUrl,
          dataLoaderOptions: {maxBatchSize: 5}
        },
        batchRef
      })
      const {data, errors} = result
      const error = errors ? new Error(errors[0]?.message) : null
      return [data, error] as [TData, typeof error]
    }
  }

  async addCreatedBySomeoneElseComment(
    viewerName: string,
    assigneeName: string,
    teamName: string,
    teamDashboardUrl: string,
    issueId: string
  ): Promise<string | Error> {
    const comment = makeCreateGitLabTaskComment(
      viewerName,
      assigneeName,
      teamName,
      teamDashboardUrl
    )
    const [noteData, noteError] = await this.createNote({body: comment, noteableId: issueId})
    if (noteError) return noteError
    const noteId = noteData.createNote?.note?.id
    if (!noteId) return new Error('Unable to create GitLab comment')
    return noteId
  }

  async createTask({
    rawContentJSON,
    integrationRepoId
  }: {
    rawContentJSON: JSONContent
    integrationRepoId: string
  }): Promise<CreateTaskResponse> {
    const {title, bodyContent} = splitTipTapContent(rawContentJSON)
    const description = convertTipTapToMarkdown(bodyContent)
    const [createIssueData, createIssueError] = await this.createIssue({
      title,
      description,
      projectPath: integrationRepoId
    })
    if (createIssueError) return createIssueError
    const issue = createIssueData.createIssue?.issue
    if (!issue) return new Error('Failed to create issue')
    const {id: gid} = issue
    return {
      integrationHash: GitLabIssueId.join(`${this.auth.providerId}`, gid),
      issueId: gid,
      integration: {
        accessUserId: this.auth.userId,
        service: 'gitlab',
        gid,
        providerId: `${this.auth.providerId}`
      }
    }
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
    const gitlabRequest = this.getGitLabRequest(this.info, this.context)
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
  }

  // gitlab refers to comments in issues as notes
  async createNote({body, noteableId}: {body: string; noteableId: string}) {
    const gitlabRequest = this.getGitLabRequest(this.info, this.context)
    const [noteData, noteError] = await gitlabRequest<CreateNoteMutation>(createNote, {
      input: {body, noteableId}
    })
    return [noteData, noteError] as const
  }

  async updateIssue(input: UpdateIssueMutationVariables['input']) {
    const gitlabRequest = this.getGitLabRequest(this.info, this.context)
    const [data, error] = await gitlabRequest<UpdateIssueMutation>(updateIssue, {input})
    return [data, error] as const
  }

  async getProjectIssues(projectIssuesArgs: GetProjectIssuesQueryVariables) {
    const gitlabRequest = this.getGitLabRequest(this.info, this.context)
    const [issuesData, issuesError] = await gitlabRequest<GetProjectIssuesQuery>(
      getProjectIssues,
      projectIssuesArgs
    )
    return [issuesData, issuesError] as const
  }

  async getProjects({first = 100, ids = null}: {first?: number; ids?: string[] | null}) {
    const gitlabRequest = this.getGitLabRequest(this.info, this.context)
    const [projectsData, projectsError] = await gitlabRequest<GetProjectsQuery>(getProjects, {
      first,
      ids
    })
    return [projectsData, projectsError] as const
  }

  async getIssue({gid}: {gid: string}) {
    const gitlabRequest = this.getGitLabRequest(this.info, this.context)
    const [issueData, issueError] = await gitlabRequest<GetIssueQuery>(getIssue, {
      gid
    })
    return [issueData, issueError] as const
  }

  /**
   * @param title - Search for the exact title of the label
   * @param titleSearch - Search for labels which titles contain the searched words
   */
  async getLabels({
    fullPath,
    first = 100,
    after,
    title,
    titleSearch
  }: {
    fullPath: string
    first?: number
    after?: string
    title?: string
    titleSearch?: string
  }) {
    const gitlabRequest = this.getGitLabRequest(this.info, this.context)
    const [data, error] = await gitlabRequest<GetLabelsQuery>(getLabels, {
      fullPath,
      first,
      after,
      title,
      titleSearch
    })
    return [data, error] as const
  }

  async createLabel(input: CreateLabelMutationVariables['input']) {
    const gitlabRequest = this.getGitLabRequest(this.info, this.context)
    const [data, error] = await gitlabRequest<CreateLabelMutation>(createLabel, {input})
    return [data, error] as const
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
