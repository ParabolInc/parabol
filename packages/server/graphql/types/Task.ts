import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import JiraServerIssueId from '~/shared/gqlIds/JiraServerIssueId'
import GitHubRepoId from '../../../client/shared/gqlIds/GitHubRepoId'
import DBTask from '../../database/types/Task'
import GitLabServerManager from '../../integrations/gitlab/GitLabServerManager'
import getSimilarTaskEstimate from '../../postgres/queries/getSimilarTaskEstimate'
import insertTaskEstimate from '../../postgres/queries/insertTaskEstimate'
import {GetIssueLabelsQuery, GetIssueLabelsQueryVariables} from '../../types/githubTypes'
import {getUserId} from '../../utils/authorization'
import getGitHubRequest from '../../utils/getGitHubRequest'
import getIssueLabels from '../../utils/githubQueries/getIssueLabels.graphql'
import sendToSentry from '../../utils/sendToSentry'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import isValid from '../isValid'
import {IGetLatestTaskEstimatesQueryResult} from './../../postgres/queries/generated/getLatestTaskEstimatesQuery'
import AgendaItem from './AgendaItem'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import PageInfoDateCursor from './PageInfoDateCursor'
import TaskEditorDetails from './TaskEditorDetails'
import TaskEstimate from './TaskEstimate'
import TaskIntegration from './TaskIntegration'
import TaskStatusEnum from './TaskStatusEnum'
import Team from './Team'
import Threadable, {threadableFields} from './Threadable'

const Task: GraphQLObjectType = new GraphQLObjectType<any, GQLContext>({
  name: 'Task',
  description: 'A long-term task shared across the team, assigned to a single user ',
  interfaces: () => [Threadable],
  isTypeOf: ({status}) => !!status,
  fields: () => ({
    ...(threadableFields() as any),
    agendaItem: {
      type: AgendaItem,
      description: 'The agenda item that the task was created in, if any',
      resolve: async ({discussionId}, _args: unknown, {dataLoader}) => {
        if (!discussionId) return null
        const discussion = await dataLoader.get('discussions').load(discussionId)
        if (!discussion) return null
        const {discussionTopicId, discussionTopicType} = discussion
        if (discussionTopicType !== 'agendaItem') return null
        return dataLoader.get('agendaItems').load(discussionTopicId)
      }
    },
    createdBy: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The userId that created the item'
    },
    createdByUser: {
      type: new GraphQLNonNull(require('./User').default),
      description: 'The user that created the item',
      resolve: ({createdBy}, _args: unknown, {dataLoader}: GQLContext) => {
        return dataLoader.get('users').load(createdBy)
      }
    },
    dueDate: {
      type: GraphQLISO8601Type,
      description: 'a user-defined due date'
    },
    estimates: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TaskEstimate))),
      description: 'A list of the most recent estimates for the task',
      resolve: async ({id: taskId, integration, teamId}: DBTask, _args: unknown, context, info) => {
        const {dataLoader, authToken} = context
        const viewerId = getUserId(authToken)
        if (integration?.service === 'jira') {
          const {accessUserId, cloudId, issueKey} = integration
          // this dataloader has the side effect of guaranteeing fresh estimates
          await dataLoader
            .get('jiraIssue')
            .load({teamId, userId: accessUserId, cloudId, issueKey, taskId, viewerId})
        } else if (integration?.service === 'azureDevOps') {
          const {accessUserId, instanceId, projectKey, issueKey} = integration
          await dataLoader.get('azureDevOpsWorkItem').load({
            teamId,
            userId: accessUserId,
            instanceId,
            workItemId: issueKey,
            taskId,
            projectId: projectKey,
            viewerId
          })
        } else if (integration?.service === 'github') {
          const {accessUserId, nameWithOwner, issueNumber} = integration
          const [githubAuth, estimates] = await Promise.all([
            dataLoader.get('githubAuth').load({userId: accessUserId, teamId}),
            dataLoader.get('latestTaskEstimates').load(taskId)
          ])
          if (estimates.length === 0) return estimates
          // TODO schedule this work to be done & pump in the updates via subcription
          if (!githubAuth) return estimates
          // fetch fresh estimates from GH
          const {accessToken} = githubAuth
          const {repoOwner, repoName} = GitHubRepoId.split(nameWithOwner)
          const githubRequest = getGitHubRequest(info, context, {accessToken})
          const [labelsData, labelsError] = await githubRequest<
            GetIssueLabelsQuery,
            GetIssueLabelsQueryVariables
          >(getIssueLabels, {
            first: 100,
            repoName,
            repoOwner,
            issueNumber
          })
          if (!labelsData) {
            if (labelsError) {
              sendToSentry(labelsError, {userId: accessUserId})
            }
            return estimates
          }
          const labelNodes = labelsData.repository?.issue?.labels?.nodes
          if (!labelNodes) return estimates
          const ghIssueLabels = labelNodes.map((node) => node?.name).filter(isValid)
          await Promise.all(
            estimates.map(async (estimate: IGetLatestTaskEstimatesQueryResult) => {
              const {githubLabelName, name: dimensionName} = estimate
              const existingLabel = ghIssueLabels.includes(githubLabelName!)
              if (existingLabel) return
              // VERY EXPENSIVE. We do this only if we're darn sure we need to
              const taskIds = await dataLoader
                .get('taskIdsByTeamAndGitHubRepo')
                .load({teamId, nameWithOwner})
              const similarEstimate = await getSimilarTaskEstimate(
                taskIds,
                dimensionName,
                ghIssueLabels
              )
              if (!similarEstimate) return
              dataLoader.get('latestTaskEstimates').clear(taskId)
              return insertTaskEstimate({
                changeSource: 'external',
                // keep the link to the discussion alive, if possible
                discussionId: estimate.discussionId,
                jiraFieldId: undefined,
                label: similarEstimate.label,
                name: estimate.name,
                meetingId: null,
                stageId: null,
                taskId,
                userId: accessUserId,
                githubLabelName: similarEstimate.githubLabelName!
              })
            })
          )
        }
        return dataLoader.get('latestTaskEstimates').load(taskId)
      }
    },
    editors: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TaskEditorDetails))),
      description:
        'a list of users currently editing the task (fed by a subscription, so queries return null)',
      resolve: (source: any) => source.editors ?? []
    },
    integration: {
      type: TaskIntegration,
      description: 'The reference to the single source of truth for this task',
      resolve: async (
        {integration, integrationHash, teamId, id: taskId}: DBTask,
        _args: unknown,
        context,
        info
      ) => {
        const {dataLoader, authToken} = context
        const viewerId = getUserId(authToken)
        if (!integration) return null
        const {accessUserId} = integration
        if (integration.service === 'jira') {
          const {cloudId, issueKey} = integration
          return dataLoader
            .get('jiraIssue')
            .load({teamId, userId: accessUserId, cloudId, issueKey, taskId, viewerId})
        } else if (integration.service === 'jiraServer') {
          const {issueId} = JiraServerIssueId.split(integrationHash!)
          const issue = await dataLoader.get('jiraServerIssue').load({
            teamId,
            userId: accessUserId,
            issueId,
            providerId: integration.providerId
          })
          return issue
            ? {
                ...issue,
                userId: accessUserId,
                teamId
              }
            : null
        } else if (integration.service === 'azureDevOps') {
          const {instanceId, projectKey, issueKey} = integration
          return dataLoader.get('azureDevOpsWorkItem').load({
            teamId,
            userId: accessUserId,
            instanceId,
            projectId: projectKey,
            viewerId,
            workItemId: issueKey
          })
        } else if (integration.service === 'github') {
          const githubAuth = await dataLoader.get('githubAuth').load({userId: accessUserId, teamId})
          if (!githubAuth) return null
          const {accessToken} = githubAuth
          const {nameWithOwner, issueNumber} = integration
          const {repoOwner, repoName} = GitHubRepoId.split(nameWithOwner)
          const query = `
                {
                  repository(owner: "${repoOwner}", name: "${repoName}") {
                    issue(number: ${issueNumber}) {
                      ...info
                    }
                  }
                }`
          const githubRequest = getGitHubRequest(info, context, {accessToken})
          const [data, error] = await githubRequest(query)
          if (error) {
            sendToSentry(error, {userId: accessUserId})
          }
          return data
        } else if (integration.service === 'gitlab') {
          const {accessUserId} = integration
          const gitlabAuth = await dataLoader
            .get('teamMemberIntegrationAuths')
            .load({service: 'gitlab', teamId, userId: accessUserId})
          if (!gitlabAuth?.accessToken) return null
          const {providerId} = gitlabAuth
          const provider = await dataLoader.get('integrationProviders').load(providerId)
          if (!provider?.serverBaseUrl) return null
          const {gid} = integration
          const query = `
            query {
              issue(id: "${gid}"){
                ...info
              }
            }
          `
          const manager = new GitLabServerManager(gitlabAuth, context, info, provider.serverBaseUrl)
          const gitlabRequest = manager.getGitLabRequest(info, context)
          const [data, error] = await gitlabRequest(query, {})
          if (error) {
            sendToSentry(error, {userId: accessUserId})
          }
          return data
        }
        return null
      }
    },
    integrationHash: {
      type: GraphQLID,
      description: 'A hash of the integrated task'
    },
    meetingId: {
      type: GraphQLID,
      description: 'the foreign key for the meeting the task was created in'
    },
    doneMeetingId: {
      type: GraphQLID,
      description: 'the foreign key for the meeting the task was marked as complete'
    },
    plaintextContent: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'the plain text content of the task'
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'the shared sort order for tasks on the team dash & user dash'
    },
    status: {
      type: new GraphQLNonNull(TaskStatusEnum),
      description: 'The status of the task'
    },
    tags: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
      description: 'The tags associated with the task'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the team (indexed). Needed for subscribing to archived tasks'
    },
    team: {
      type: new GraphQLNonNull(Team),
      description: 'The team this task belongs to',
      resolve: ({teamId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The first block of the content',
      resolve: ({plaintextContent}) => {
        const firstBreak = plaintextContent.trim().indexOf('\n')
        const endIndex = firstBreak > -1 ? firstBreak : plaintextContent.length
        return plaintextContent.slice(0, endIndex)
      }
    },
    userId: {
      type: GraphQLID,
      description:
        '* The userId, index useful for server-side methods getting all tasks under a user. This can be null if the task is not assigned to anyone.'
    },
    user: {
      type: require('./User').default,
      description: 'The user the task is assigned to. Null if it is not assigned to anyone.',
      resolve: ({userId}, _args: unknown, {dataLoader}) => {
        if (!userId) return null
        return dataLoader.get('users').load(userId)
      }
    },
    isHighlighted: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'The owner hovers over the task in their solo update of a checkin',
      args: {
        meetingId: {
          type: GraphQLID,
          description: 'Meeting for which the highlight is checked'
        }
      },
      resolve: async ({id: taskId}, {meetingId}: {meetingId?: string | null}, {dataLoader}) => {
        if (!meetingId) return false
        const highlightedTaskId = await dataLoader.get('meetingHighlightedTaskId').load(meetingId)
        return taskId === highlightedTaskId
      }
    }
  })
})

const {connectionType, edgeType} = connectionDefinitions({
  name: Task.name,
  nodeType: Task,
  edgeFields: () => ({
    cursor: {
      type: GraphQLISO8601Type
    }
  }),
  connectionFields: () => ({
    pageInfo: {
      type: PageInfoDateCursor,
      description: 'Page info with cursors coerced to ISO8601 dates'
    }
  })
})

export const TaskConnection = connectionType
export const TaskEdge = edgeType
export default Task
