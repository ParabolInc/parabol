import {
  GraphQLFloat,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import GitHubRepoId from '../../../client/shared/gqlIds/GitHubRepoId'
import DBTask from '../../database/types/Task'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import {GitHubRequest} from '../rootSchema'
import AgendaItem from './AgendaItem'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import PageInfoDateCursor from './PageInfoDateCursor'
import TaskEditorDetails from './TaskEditorDetails'
import TaskEstimate from './TaskEstimate'
import TaskIntegration from './TaskIntegration'
import TaskStatusEnum from './TaskStatusEnum'
import Team from './Team'
import Threadable, {threadableFields} from './Threadable'

const Task = new GraphQLObjectType<any, GQLContext>({
  name: 'Task',
  description: 'A long-term task shared across the team, assigned to a single user ',
  interfaces: () => [Threadable],
  isTypeOf: ({status}) => !!status,
  fields: () => ({
    ...(threadableFields() as any),
    agendaItem: {
      type: AgendaItem,
      description: 'The agenda item that the task was created in, if any',
      resolve: async ({discussionId}, _args, {dataLoader}) => {
        if (!discussionId) return null
        const discussion = await dataLoader.get('discussions').load(discussionId)
        if (!discussion) return null
        const {discussionTopicId, discussionTopicType} = discussion
        if (discussionTopicType !== 'agendaItem') return null
        return dataLoader.get('agendaItems').load(discussionTopicId)
      }
    },
    createdBy: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The userId that created the item'
    },
    createdByUser: {
      type: GraphQLNonNull(require('./User').default),
      description: 'The user that created the item',
      resolve: ({createdBy}, _args, {dataLoader}: GQLContext) => {
        return dataLoader.get('users').load(createdBy)
      }
    },
    dueDate: {
      type: GraphQLISO8601Type,
      description: 'a user-defined due date'
    },
    estimates: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(TaskEstimate))),
      description: 'A list of the most recent estimates for the task',
      resolve: async ({id: taskId, integration, teamId}: DBTask, _args, {dataLoader}) => {
        if (integration?.service === 'jira') {
          const {accessUserId, cloudId, issueKey} = integration
          // this dataloader has the side effect of guaranteeing fresh estimates
          console.log('task estimates query calling jiraIssue dataloader')
          await dataLoader.get('jiraIssue').load({teamId, userId: accessUserId, cloudId, issueKey})
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
      resolve: async ({integration, teamId}: DBTask, _args, context, info) => {
        const {dataLoader} = context
        if (!integration) return null
        const {accessUserId} = integration
        if (integration.service === 'jira') {
          const {cloudId, issueKey} = integration
          console.log('task integration query calling jiraIssue dataloader')
          return dataLoader.get('jiraIssue').load({teamId, userId: accessUserId, cloudId, issueKey})
        } else if (integration.service === 'github') {
          const githubAuth = await dataLoader.get('githubAuth').load({userId: accessUserId, teamId})
          if (!githubAuth) return null
          const {accessToken} = githubAuth
          const endpointContext = {accessToken}
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
          const githubRequest = (info.schema as any).githubRequest as GitHubRequest
          const {data, errors} = await githubRequest({
            query,
            endpointContext,
            batchRef: context,
            info
          })
          if (errors) {
            console.log(errors)
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
      resolve: ({teamId}, _args, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    },
    title: {
      type: GraphQLNonNull(GraphQLString),
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
      resolve: ({userId}, _args, {dataLoader}) => {
        if (!userId) return null
        return dataLoader.get('users').load(userId)
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
