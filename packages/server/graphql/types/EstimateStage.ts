import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import TaskIntegrationJiraServer from '../../database/types/TaskIntegrationJiraServer'
import JiraProjectKeyId from '../../../client/shared/gqlIds/JiraProjectKeyId'
import {SprintPokerDefaults} from '../../../client/types/constEnums'
import EstimateStageDB from '../../database/types/EstimateStage'
import {NewMeetingPhaseTypeEnum} from '../../database/types/GenericMeetingPhase'
import MeetingPoker from '../../database/types/MeetingPoker'
import GitLabServerManager from '../../integrations/gitlab/GitLabServerManager'
import getRedis from '../../utils/getRedis'
import sendToSentry from '../../utils/sendToSentry'
import {GQLContext} from '../graphql'
import isValid from '../isValid'
import {getUserId} from './../../utils/authorization'
import DiscussionThreadStage, {discussionThreadStageFields} from './DiscussionThreadStage'
import EstimateUserScore from './EstimateUserScore'
import NewMeetingStage, {newMeetingStageFields} from './NewMeetingStage'
import ServiceField from './ServiceField'
import Task from './Task'
import TemplateDimensionRef from './TemplateDimensionRef'
import User from './User'

interface Source extends EstimateStageDB {
  teamId: string
  meetingId: string
  phaseType: 'ESTIMATE'
}

const EstimateStage = new GraphQLObjectType<Source, GQLContext>({
  name: 'EstimateStage',
  description: 'The stage where the team estimates & discusses a single task',
  interfaces: () => [NewMeetingStage, DiscussionThreadStage],
  isTypeOf: ({phaseType}) => (phaseType as NewMeetingPhaseTypeEnum) === 'ESTIMATE',
  fields: () => ({
    ...newMeetingStageFields(),
    ...discussionThreadStageFields(),
    creatorUserId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the user that added this stage.'
    },
    taskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID that points to the issue that exists in parabol'
    },
    serviceField: {
      type: new GraphQLNonNull(ServiceField),
      description: 'The field name used by the service for this dimension',
      resolve: async (
        {dimensionRefIdx, meetingId, teamId, taskId},
        _args: unknown,
        context,
        info
      ) => {
        const {dataLoader, authToken} = context
        const NULL_FIELD = {name: '', type: 'string'}
        const task = await dataLoader.get('tasks').load(taskId)
        if (!task) return NULL_FIELD
        const {integration} = task
        if (!integration) return NULL_FIELD
        const {service} = integration
        const getDimensionName = async (meetingId: string) => {
          const meeting = await dataLoader.get('newMeetings').load(meetingId)
          const {templateRefId} = meeting as MeetingPoker
          const templateRef = await dataLoader.get('templateRefs').loadNonNull(templateRefId)
          const {dimensions} = templateRef
          const dimensionRef = dimensions[dimensionRefIdx]!
          const {name: dimensionName} = dimensionRef
          return dimensionName
        }

        if (service === 'jira') {
          const {cloudId, issueKey} = integration
          const projectKey = JiraProjectKeyId.join(issueKey)
          const [dimensionName, team] = await Promise.all([
            getDimensionName(meetingId),
            dataLoader.get('teams').load(teamId)
          ])
          const jiraDimensionFields = team?.jiraDimensionFields || []
          const existingDimensionField = jiraDimensionFields.find(
            (field) =>
              field.dimensionName === dimensionName &&
              field.cloudId === cloudId &&
              field.projectKey === projectKey
          )

          if (existingDimensionField)
            return {
              name: existingDimensionField.fieldName,
              type: existingDimensionField.fieldType
            }

          return {name: SprintPokerDefaults.SERVICE_FIELD_COMMENT, type: 'string'}
        }
        if (service === 'jiraServer') {
          const {providerId, repositoryId: projectId} = integration as TaskIntegrationJiraServer
          const dimensionName = await getDimensionName(meetingId)
          const existingDimensionField = await dataLoader.get('jiraServerDimensionFieldMap').load({providerId, projectId, teamId, dimensionName})
          if (existingDimensionField) {
            return {
              name: existingDimensionField.fieldName,
              type: existingDimensionField.fieldType
            }
          }
          return {name: SprintPokerDefaults.SERVICE_FIELD_COMMENT, type: 'string'}
        }
        if (service === 'azureDevOps') {
          const {instanceId, projectKey} = integration
          const dimensionName = await getDimensionName(meetingId)
          const azureDevOpsDimensionFieldMapEntry = await dataLoader
            .get('azureDevOpsDimensionFieldMap')
            .load({teamId, dimensionName, instanceId, projectKey})
          if (azureDevOpsDimensionFieldMapEntry) {
            return {
              name: azureDevOpsDimensionFieldMapEntry.fieldName,
              type: azureDevOpsDimensionFieldMapEntry.fieldType
            }
          }
          return {name: SprintPokerDefaults.SERVICE_FIELD_COMMENT, type: 'string'}
        }

        if (service === 'github') {
          const {nameWithOwner} = integration
          const dimensionName = await getDimensionName(meetingId)
          const githubFieldMap = await dataLoader
            .get('githubDimensionFieldMaps')
            .load({teamId, dimensionName, nameWithOwner})
          if (githubFieldMap) {
            return {
              name: githubFieldMap.labelTemplate,
              type: 'string'
            }
          }
          return {
            name: SprintPokerDefaults.SERVICE_FIELD_COMMENT,
            type: 'string'
          }
        }
        if (service === 'gitlab') {
          const {gid, accessUserId} = integration
          const gitlabAuth = await dataLoader
            .get('teamMemberIntegrationAuths')
            .load({service: 'gitlab', teamId, userId: accessUserId})
          if (!gitlabAuth?.accessToken) return NULL_FIELD
          const {providerId} = gitlabAuth
          const provider = await dataLoader.get('integrationProviders').loadNonNull(providerId)
          const manager = new GitLabServerManager(
            gitlabAuth,
            context,
            info,
            provider.serverBaseUrl!
          )
          const [issueData, issueError] = await manager.getIssue({gid})
          if (issueError) {
            const userId = getUserId(authToken)
            sendToSentry(issueError, {userId, tags: {teamId, gid}})
            return NULL_FIELD
          }
          const {issue} = issueData
          if (!issue) return NULL_FIELD
          const {projectId} = issue
          const dimensionName = await getDimensionName(meetingId)
          const gitlabFieldMap = await dataLoader
            .get('gitlabDimensionFieldMaps')
            .load({teamId, dimensionName, projectId, providerId})
          if (gitlabFieldMap) {
            return {
              name: gitlabFieldMap.labelTemplate,
              type: 'string'
            }
          }
          return {
            name: SprintPokerDefaults.SERVICE_FIELD_COMMENT,
            type: 'string'
          }
        }
        return NULL_FIELD
      }
    },
    dimensionRefIdx: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The immutable index of the dimensionRef tied to this stage'
    },
    dimensionRef: {
      type: new GraphQLNonNull(TemplateDimensionRef),
      description: 'The immutable dimension linked to this stage',
      resolve: async ({meetingId, dimensionRefIdx}, _args: unknown, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const {templateRefId} = meeting as MeetingPoker
        const templateRef = await dataLoader.get('templateRefs').loadNonNull(templateRefId)
        const {dimensions} = templateRef
        const {name, scaleRefId} = dimensions[dimensionRefIdx]!
        return {
          name,
          scaleRefId,
          dimensionRefIdx,
          meetingId
        }
      }
    },
    finalScore: {
      type: GraphQLString,
      description: 'the final score, as defined by the facilitator',
      resolve: async ({taskId, meetingId, dimensionRefIdx}, _args: unknown, {dataLoader}) => {
        const [meeting, estimates] = await Promise.all([
          dataLoader.get('newMeetings').load(meetingId),
          dataLoader.get('meetingTaskEstimates').load({taskId, meetingId})
        ])
        const {templateRefId} = meeting as MeetingPoker
        const templateRef = await dataLoader.get('templateRefs').loadNonNull(templateRefId)
        const {dimensions} = templateRef
        const dimensionRef = dimensions[dimensionRefIdx]!
        const {name: dimensionName} = dimensionRef
        const dimensionEstimate = estimates.find((estimate) => estimate.name === dimensionName)
        return dimensionEstimate?.label ?? null
      }
    },
    hoveringUserIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'the userIds of the team members hovering the deck',
      resolve: async ({id: stageId}) => {
        const redis = getRedis()
        const userIds = await redis.smembers(`pokerHover:${stageId}`)
        return userIds
      }
    },
    hoveringUsers: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      description: 'the users of the team members hovering the deck',
      resolve: async ({id: stageId}, _args: unknown, {dataLoader}) => {
        const redis = getRedis()
        const userIds = await redis.smembers(`pokerHover:${stageId}`)
        if (userIds.length === 0) return []
        return (await dataLoader.get('users').loadMany(userIds)).filter(isValid)
      }
    },
    scores: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(EstimateUserScore))),
      description: 'all the estimates, 1 per user',
      resolve: ({id: stageId, scores}) => {
        return scores.map((score) => ({
          ...score,
          stageId
        }))
      }
    },
    task: {
      type: Task,
      description:
        'The task referenced in the stage, as it exists in Parabol. null if the task was deleted',
      resolve: async ({taskId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('tasks').load(taskId)
      }
    },
    isVoting: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description:
        'true when the participants are still voting and results are hidden. false when votes are revealed'
    }
  })
})

export default EstimateStage
