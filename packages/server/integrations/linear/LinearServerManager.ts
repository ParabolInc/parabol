import {JSONContent} from '@tiptap/core'
import {GraphQLResolveInfo} from 'graphql'
import LinearIssueId from 'parabol-client/shared/gqlIds/LinearIssueId'
import {splitTipTapContent} from 'parabol-client/shared/tiptap/splitTipTapContent'
import {GQLContext} from '../../graphql/graphql'
import createCommentMutation from '../../graphql/nestedSchema/Linear/mutations/createComment.graphql'
import createIssueMutation from '../../graphql/nestedSchema/Linear/mutations/createIssue.graphql'
import createLabelMutation from '../../graphql/nestedSchema/Linear/mutations/createLabel.graphql'
import updateIssueMutation from '../../graphql/nestedSchema/Linear/mutations/updateIssue.graphql'
import getIssueQuery from '../../graphql/nestedSchema/Linear/queries/getIssue.graphql'
import getLabelsQuery from '../../graphql/nestedSchema/Linear/queries/getLabels.graphql'
import getProfileQuery from '../../graphql/nestedSchema/Linear/queries/getProfile.graphql'
import getProjectIssuesQuery from '../../graphql/nestedSchema/Linear/queries/getProjectIssues.graphql'
import getProjectsQuery from '../../graphql/nestedSchema/Linear/queries/getProjects.graphql'
import {TeamMemberIntegrationAuth} from '../../postgres/types'
import {
  CreateCommentMutation,
  CreateCommentMutationVariables,
  CreateIssueMutation,
  CreateIssueMutationVariables,
  CreateLabelMutation,
  CreateLabelMutationVariables,
  GetIssueQuery,
  GetIssueQueryVariables,
  GetLabelsQuery,
  GetLabelsQueryVariables,
  GetProjectIssuesQuery,
  GetProjectIssuesQueryVariables,
  GetProjectsQuery,
  UpdateIssueMutation,
  UpdateIssueMutationVariables
} from '../../types/linearTypes'
import {convertTipTapToMarkdown} from '../../utils/convertTipTapToMarkdown'
import makeCreateLinearTaskComment from '../../utils/makeCreateLinearTaskComment'
import {CreateTaskResponse, TaskIntegrationManager} from '../TaskIntegrationManagerFactory'

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
    const {schema} = info
    const composedRequest = (schema as any).linearRequest
    if (!composedRequest) {
      throw new Error('linearRequest composer not found on schema. Ensure it is configured.')
    }

    return async <TData = any, TVars = any>(query: string, variables: TVars) => {
      // Note: we're always using the default executor of the nested schema
      //       (https://api.linear.app/graphql)
      const result = await composedRequest({
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
    context?: GQLContext
    info?: GraphQLResolveInfo
  }): Promise<CreateTaskResponse | Error> {
    const {rawContentJSON, integrationRepoId} = params

    if (!integrationRepoId) {
      return new Error('integrationRepoId is required and cannot be empty.')
    }

    const ids = integrationRepoId.split(':')
    const teamId = ids[0]
    const projectId = ids.length > 1 ? ids[1] : undefined

    if (!teamId) {
      return new Error('Could not parse teamId from integrationRepoId.')
    }
    const {title, bodyContent} = splitTipTapContent(rawContentJSON)
    const description = convertTipTapToMarkdown(bodyContent)

    // Use provided context/info if available, otherwise use the ones from constructor
    const info = params.info ?? this.info
    const context = params.context ?? this.context

    const [createIssueData, createIssueError] = await this.createIssueInternal({
      info,
      context,
      variables: {
        title,
        description,
        teamId,
        projectId
      }
    })

    if (createIssueError) {
      throw createIssueError
    }

    const issue = createIssueData?.issueCreate?.issue
    if (!issue || !issue.id || !issue.identifier) {
      return new Error('Failed to create Linear issue or missing ID/identifier in response.')
    }

    // Cast providerId to string as the integration type expects string
    const providerId = String(this.auth.providerId)

    return {
      integrationHash: LinearIssueId.join(providerId, issue.id),
      issueId: issue.id,
      integration: {
        accessUserId: this.auth.userId,
        service: 'linear',
        gid: issue.id,
        providerId: providerId
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

    // Assuming this method uses the constructor's info/context
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

  async updateIssue(
    variables: UpdateIssueMutationVariables
  ): Promise<[UpdateIssueMutation | null, Error | null]> {
    const linearRequest = this.getLinearRequest(this.info, this.context)
    const [data, error] = await linearRequest(updateIssueMutation, variables)
    return [data, error]
  }

  async getProjectIssues(
    args: GetProjectIssuesQueryVariables
  ): Promise<[GetProjectIssuesQuery | null, Error | null]> {
    // Assuming this method uses the constructor's info/context
    const linearRequest = this.getLinearRequest(this.info, this.context)
    const [data, error] = await linearRequest(getProjectIssuesQuery, args)
    return [data, error]
  }

  async getProjects({
    first = 100,
    ids = null
  }: {
    first?: number
    ids?: string[] | null
  }): Promise<[GetProjectsQuery | null, Error | null]> {
    // Assuming this method uses the constructor's info/context
    const linearRequest = this.getLinearRequest(this.info, this.context)
    const [data, error] = await linearRequest(getProjectsQuery, {first, ids})
    return [data, error]
  }

  async getIssue(args: GetIssueQueryVariables): Promise<[GetIssueQuery | null, Error | null]> {
    // Assuming this method uses the constructor's info/context
    const linearRequest = this.getLinearRequest(this.info, this.context)
    const [data, error] = await linearRequest(getIssueQuery, args)
    return [data, error]
  }

  async getLabels(args: GetLabelsQueryVariables): Promise<[GetLabelsQuery | null, Error | null]> {
    // Assuming this method uses the constructor's info/context
    const linearRequest = this.getLinearRequest(this.info, this.context)
    const [data, error] = await linearRequest(getLabelsQuery, args)
    return [data, error]
  }

  async createLabel(
    variables: CreateLabelMutationVariables
  ): Promise<[CreateLabelMutation | null, Error | null]> {
    const linearRequest = this.getLinearRequest(this.info, this.context)
    const [data, error] = await linearRequest(createLabelMutation, variables)
    return [data, error]
  }

  async isTokenValid(
    info: GraphQLResolveInfo,
    context: Record<any, any>
  ): Promise<[boolean, Error | null]> {
    if (!this.auth.accessToken) {
      return [false, new Error('LinearServerManager has no access token')]
    }

    // Use the provided info/context for this specific check, not necessarily the constructor ones
    const linearRequest = this.getLinearRequest(info, context)
    const [, error] = await linearRequest(getProfileQuery, {})

    if (error) {
      return [false, error]
    }

    return [true, null]
  }

  async createIssueInternal({
    info,
    context,
    variables
  }: {
    info: GraphQLResolveInfo
    context: GQLContext
    variables: CreateIssueMutationVariables
  }): Promise<[CreateIssueMutation | null, Error | null]> {
    const linearRequest = this.getLinearRequest(info, context)
    // Pass the imported GraphQL document
    const [data, error] = await linearRequest(createIssueMutation, variables)
    // Cast the result back to the expected types for type safety downstream
    return [data, error]
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
    return [data, error]
  }
}

export default LinearServerManager
