import {JSONContent} from '@tiptap/core'
import {GraphQLResolveInfo} from 'graphql'
import LinearIssueId from 'parabol-client/shared/gqlIds/LinearIssueId'
import LinearProjectId from 'parabol-client/shared/gqlIds/LinearProjectId'
import {splitTipTapContent} from 'parabol-client/shared/tiptap/splitTipTapContent'
import {GQLContext} from '../../graphql/graphql'
import createCommentMutation from '../../graphql/nestedSchema/Linear/mutations/createComment.graphql'
import createIssueMutation from '../../graphql/nestedSchema/Linear/mutations/createIssue.graphql'
import updateIssueMutation from '../../graphql/nestedSchema/Linear/mutations/updateIssue.graphql'
import getIssueQuery from '../../graphql/nestedSchema/Linear/queries/getIssue.graphql'
import getProfileQuery from '../../graphql/nestedSchema/Linear/queries/getProfile.graphql'
import getProjectIssuesQuery from '../../graphql/nestedSchema/Linear/queries/getProjectIssues.graphql'
import getProjectsQuery from '../../graphql/nestedSchema/Linear/queries/getProjects.graphql'
import getTeamsAndProjectsQuery from '../../graphql/nestedSchema/Linear/queries/getTeamsAndProjects.graphql'
import {linearRequest} from '../../graphql/public/rootSchema'
import {TeamMemberIntegrationAuth} from '../../postgres/types'
import {
  CreateCommentMutation,
  CreateCommentMutationVariables,
  CreateIssueMutation,
  GetIssueQuery,
  GetProjectIssuesQuery,
  GetProjectIssuesQueryVariables,
  GetProjectsQuery,
  GetTeamsAndProjectsQuery,
  UpdateIssueMutation,
  UpdateIssueMutationVariables
} from '../../types/linearTypes'
import {convertTipTapToMarkdown} from '../../utils/convertTipTapToMarkdown'
import {CreateTaskResponse, TaskIntegrationManager} from '../TaskIntegrationManagerFactory'
import makeCreateLinearTaskComment from './makeCreateLinearTaskComment'

class LinearServerManager implements TaskIntegrationManager {
  public title = 'Linear'
  private readonly auth: TeamMemberIntegrationAuth
  private readonly context: GQLContext
  private readonly info: GraphQLResolveInfo

  constructor(auth: TeamMemberIntegrationAuth, context: GQLContext, info: GraphQLResolveInfo) {
    this.auth = auth
    this.context = context
    this.info = info
  }

  getLinearRequest(info: GraphQLResolveInfo, batchRef: Record<any, any>) {
    return async <TData = any, TVars = any>(query: string, variables: TVars) => {
      const result = await linearRequest<TData, TVars>({
        query,
        variables,
        info,
        endpointContext: {
          accessToken: this.auth.accessToken,
          dataLoaderOptions: {maxBatchSize: 5}
        },
        batchRef
      })
      const {data, errors} = result
      const error = errors ? new Error(errors[0]?.message) : null
      return [data, error] as [TData, typeof error]
    }
  }

  async createTask(params: {
    rawContentJSON: JSONContent
    integrationRepoId: string // Format: "teamId:projectId" or "teamId"
  }): Promise<CreateTaskResponse | Error> {
    const {rawContentJSON, integrationRepoId} = params

    if (!integrationRepoId) {
      return new Error('integrationRepoId is required and cannot be empty.')
    }

    const {teamId, projectId} = LinearProjectId.split(integrationRepoId)

    if (!teamId) {
      return new Error('Could not parse teamId from integrationRepoId.')
    }
    const {title, bodyContent} = splitTipTapContent(rawContentJSON)
    const description = convertTipTapToMarkdown(bodyContent)

    const [createIssueData, createIssueError] = await this.createIssueInternal({
      title,
      description,
      teamId,
      projectId: projectId ? projectId : null
    })

    if (createIssueError) {
      return createIssueError
    }

    const issue = createIssueData?.issueCreate?.issue
    if (!issue || !issue.id) {
      return new Error('Failed to create Linear issue or missing ID/identifier in response.')
    }

    return {
      integrationHash: LinearIssueId.join(integrationRepoId, issue.id),
      issueId: issue.id,
      integration: {
        accessUserId: this.auth.userId,
        service: 'linear',
        issueId: issue.id,
        repoId: integrationRepoId
      }
    }
  }

  async addCreatedBySomeoneElseComment(
    viewerName: string,
    assigneeName: string,
    teamName: string,
    teamDashboardUrl: string,
    issueId: string
  ): Promise<string | Error> {
    const body = makeCreateLinearTaskComment(viewerName, assigneeName, teamName, teamDashboardUrl)

    const [commentData, commentError] = await this.createCommentInternal({
      info: this.info,
      context: this.context,
      variables: {body, issueId}
    })

    if (commentError) {
      throw commentError
    }

    const commentId = commentData?.commentCreate?.comment?.id
    if (!commentId) {
      return new Error('Unable to create Linear comment or missing ID in response.')
    }
    return commentId
  }

  async updateIssue(variables: UpdateIssueMutationVariables) {
    const linearRequest = this.getLinearRequest(this.info, this.context)

    const [data, error] = await linearRequest<UpdateIssueMutation>(updateIssueMutation, variables)
    return [data, error] as const
  }

  async getProjectIssues(
    args: GetProjectIssuesQueryVariables
  ): Promise<[GetProjectIssuesQuery | null, Error | null]> {
    const linearRequest = this.getLinearRequest(this.info, this.context)
    const [data, error] = await linearRequest<GetProjectIssuesQuery>(getProjectIssuesQuery, args)
    return [data, error] as const
  }

  async getProjects({first = 100, ids = null}: {first?: number; ids?: string[] | null}) {
    const linearRequest = this.getLinearRequest(this.info, this.context)
    const [data, error] = await linearRequest<GetProjectsQuery>(getProjectsQuery, {first, ids})
    return [data, error] as const
  }

  async getIssue({id}: {id: string}) {
    const linearRequest = this.getLinearRequest(this.info, this.context)
    const [data, error] = await linearRequest<GetIssueQuery>(getIssueQuery, {id})
    return [data, error] as const
  }

  async getTeamsAndProjects({first = 100, ids = null}: {first?: number; ids?: string[] | null}) {
    const linearRequest = this.getLinearRequest(this.info, this.context)
    const [data, error] = await linearRequest<GetTeamsAndProjectsQuery>(getTeamsAndProjectsQuery, {
      first,
      ids
    })
    return [data, error] as const
  }

  async createComment(variables: CreateCommentMutationVariables) {
    const [data, error] = await this.createCommentInternal({
      info: this.info,
      context: this.context,
      variables
    })
    return [data, error] as const
  }

  async isTokenValid(info: GraphQLResolveInfo, context: Record<any, any>) {
    if (!this.auth.accessToken) {
      return [false, new Error('LinearServerManager has no access token')]
    }

    const linearRequest = this.getLinearRequest(info, context)
    const [, error] = await linearRequest(getProfileQuery, {})

    if (error) {
      return [false, error]
    }

    return [true, null]
  }

  async createIssueInternal({
    title,
    description,
    teamId,
    projectId
  }: {
    title: string
    description: string
    teamId: string
    projectId: string | null
  }) {
    const linearRequest = this.getLinearRequest(this.info, this.context)
    const [data, error] = await linearRequest<CreateIssueMutation>(createIssueMutation, {
      input: {
        title,
        description,
        teamId,
        projectId
      }
    })

    return [data, error] as const
  }

  async createCommentInternal({
    info,
    context,
    variables
  }: {
    info: GraphQLResolveInfo
    context: GQLContext
    variables: CreateCommentMutationVariables
  }): Promise<[CreateCommentMutation | null, Error | null]> {
    const linearRequest = this.getLinearRequest(info, context)
    const [data, error] = await linearRequest(createCommentMutation, variables)
    return [data, error] as const
  }
}

export default LinearServerManager
