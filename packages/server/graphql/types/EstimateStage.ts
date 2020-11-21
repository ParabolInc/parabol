import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import {NewMeetingPhaseTypeEnum} from '../../../client/types/graphql'
import db from '../../db'
import getRedis from '../../utils/getRedis'
import {GQLContext} from '../graphql'
import EstimateUserScore from './EstimateUserScore'
import NewMeetingStage, {newMeetingStageFields} from './NewMeetingStage'
import Story from './Story'
import TaskServiceEnum from './TaskServiceEnum'
import TemplateDimension from './TemplateDimension'
import User from './User'
import {SprintPokerDefaults} from '~/types/constEnums'
import MeetingPoker from '../../database/types/MeetingPoker'
import JiraDimensionField from '../../database/types/JiraDimensionField'
import getRethink from '../../database/rethinkDriver'

export const estimateStageFields = () => ({})

const EstimateStage = new GraphQLObjectType<any, GQLContext>({
  name: 'EstimateStage',
  description: 'The stage where the team estimates & discusses a single task',
  interfaces: () => [NewMeetingStage],
  isTypeOf: ({phaseType}) => phaseType === NewMeetingPhaseTypeEnum.ESTIMATE,
  fields: () => ({
    ...newMeetingStageFields(),
    creatorUserId: {
      type: GraphQLNonNull(GraphQLID),
      description:
        'The id of the user that added this stage. Useful for knowing which access key to use to get the underlying issue'
    },
    service: {
      type: GraphQLNonNull(TaskServiceEnum),
      description: 'The service the task is connected to',
      resolve: ({service}) => service || 'PARABOL'
    },
    serviceTaskId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The stringified JSON used to fetch the task used by the service'
    },
    serviceFieldName: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The field name used by the service for this dimension',
      resolve: async ({dimensionId, meetingId, service, teamId}, _args, {dataLoader}) => {
        if (service === 'jira') {
          const team = await dataLoader.get('teams').load(teamId)
          const jiraDimensionFields = team.jiraDimensionFields || []
          const existingDimensionField = jiraDimensionFields.find(
            (dimensionField) => dimensionField.dimensionId === dimensionId
          )
          if (existingDimensionField) return existingDimensionField.fieldName

          // This is first time accessing the serviceFieldName, set it up on the Team
          const meeting = (await dataLoader.get('newMeetings').load(meetingId)) as MeetingPoker
          const {templateId} = meeting
          const sortedTemplateDimensions = await dataLoader
            .get('dimensionsByTemplateId')
            .load(templateId)
          const [firstDimension] = sortedTemplateDimensions
          const isFirst = firstDimension.id === dimensionId
          const fieldName = isFirst
            ? SprintPokerDefaults.JIRA_FIELD_DEFAULT
            : (SprintPokerDefaults.JIRA_FIELD_COMMENT as string)
          const dimensionField = new JiraDimensionField({dimensionId, fieldName})
          jiraDimensionFields.push(dimensionField)
          const r = await getRethink()
          await r
            .table('Team')
            .get(teamId)
            .update({
              jiraDimensionFields
            })
            .run()
          return fieldName
        } else {
          return SprintPokerDefaults.JIRA_FIELD_NULL
        }
      }
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The sort order for reprioritizing discussion topics'
    },
    dimensionId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'the dimensionId that corresponds to this stage'
    },
    dimension: {
      type: GraphQLNonNull(TemplateDimension),
      description: 'the dimension related to this stage by dimension id',
      resolve: async ({dimensionId}, _args, {dataLoader}) => {
        return dataLoader.get('templateDimensions').load(dimensionId)
      }
    },
    finalScore: {
      type: GraphQLString,
      description: 'the final score, as defined by the facilitator'
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
    story: {
      type: Story,
      description:
        'the story referenced in the stage. Either a Parabol Task or something similar from an integration. Null if fetching from service failed',
      resolve: async ({service, serviceTaskId, teamId, creatorUserId}, _args, {dataLoader}) => {
        if (service === 'jira') {
          const [cloudId, issueKey] = serviceTaskId.split(':')
          return dataLoader
            .get('jiraIssue')
            .load({cloudId, issueKey, teamId, userId: creatorUserId})
        }
        return dataLoader.get('tasks').load(serviceTaskId)
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
