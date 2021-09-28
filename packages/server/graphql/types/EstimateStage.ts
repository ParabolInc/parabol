import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import {SprintPokerDefaults} from '../../../client/types/constEnums'
import EstimateStageDB from '../../database/types/EstimateStage'
import {NewMeetingPhaseTypeEnum} from '../../database/types/GenericMeetingPhase'
import MeetingPoker from '../../database/types/MeetingPoker'
import db from '../../db'
import getRedis from '../../utils/getRedis'
import {GQLContext} from '../graphql'
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
      type: GraphQLNonNull(GraphQLID),
      description: 'The id of the user that added this stage.'
    },
    taskId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The ID that points to the issue that exists in parabol'
    },
    serviceField: {
      type: GraphQLNonNull(ServiceField),
      description: 'The field name used by the service for this dimension',
      resolve: async ({dimensionRefIdx, meetingId, teamId, taskId}, _args, {dataLoader}) => {
        const NULL_FIELD = {name: '', type: 'string'}
        const task = await dataLoader.get('tasks').load(taskId)
        if (!task) return NULL_FIELD
        const {integration} = task
        if (!integration) return NULL_FIELD
        const {service} = integration
        const getDimensionName = async (meetingId: string) => {
          const meeting = await dataLoader.get('newMeetings').load(meetingId)
          const {templateRefId} = meeting
          const templateRef = await dataLoader.get('templateRefs').load(templateRefId)
          const {dimensions} = templateRef
          const dimensionRef = dimensions[dimensionRefIdx]
          const {name: dimensionName} = dimensionRef
          return dimensionName
        }

        if (service === 'jira') {
          const {cloudId, projectKey} = integration
          const [dimensionName, team] = await Promise.all([
            getDimensionName(meetingId),
            dataLoader.get('teams').load(teamId)
          ])
          const jiraDimensionFields = team.jiraDimensionFields || []
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
        return NULL_FIELD
      }
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The sort order for reprioritizing discussion topics'
    },
    dimensionRefIdx: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'The immutable index of the dimensionRef tied to this stage'
    },
    dimensionRef: {
      type: GraphQLNonNull(TemplateDimensionRef),
      description: 'The immutable dimension linked to this stage',
      resolve: async ({meetingId, dimensionRefIdx}, _args, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const {templateRefId} = meeting as MeetingPoker
        const templateRef = await dataLoader.get('templateRefs').load(templateRefId)
        const {dimensions} = templateRef
        const {name, scaleRefId} = dimensions[dimensionRefIdx]
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
      resolve: async ({taskId, meetingId, dimensionRefIdx}, _args, {dataLoader}) => {
        const [meeting, estimates] = await Promise.all([
          dataLoader.get('newMeetings').load(meetingId),
          dataLoader.get('meetingTaskEstimates').load({taskId, meetingId})
        ])
        const {templateRefId} = meeting
        const templateRef = await dataLoader.get('templateRefs').load(templateRefId)
        const {dimensions} = templateRef
        const dimensionRef = dimensions[dimensionRefIdx]
        const {name: dimensionName} = dimensionRef
        const dimensionEstimate = estimates.find((estimate) => estimate.name === dimensionName)
        return dimensionEstimate?.label ?? null
      }
    },
    hoveringUserIds: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLID))),
      description: 'the userIds of the team members hovering the deck',
      resolve: async ({id: stageId}) => {
        const redis = getRedis()
        const userIds = await redis.smembers(`pokerHover:${stageId}`)
        return userIds
      }
    },
    hoveringUsers: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(User))),
      description: 'the users of the team members hovering the deck',
      resolve: async ({id: stageId}) => {
        const redis = getRedis()
        const userIds = await redis.smembers(`pokerHover:${stageId}`)
        if (userIds.length === 0) return []
        const users = await db.readMany('User', userIds)
        return users
      }
    },
    scores: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(EstimateUserScore))),
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
      resolve: async ({taskId}, _args, {dataLoader}) => {
        return dataLoader.get('tasks').load(taskId)
      }
    },
    isVoting: {
      type: GraphQLNonNull(GraphQLBoolean),
      description:
        'true when the participants are still voting and results are hidden. false when votes are revealed'
    }
  })
})

export default EstimateStage
