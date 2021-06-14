import {GraphQLFloat, GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {NewMeetingPhaseTypeEnum} from '../../database/types/GenericMeetingPhase'
import ReflectionGroup from '../../database/types/ReflectionGroup'
import {GQLContext} from '../graphql'
import DiscussionThreadStage, {discussionThreadStageFields} from './DiscussionThreadStage'
import NewMeetingStage, {newMeetingStageFields} from './NewMeetingStage'
import RetroReflectionGroup from './RetroReflectionGroup'

const RetroDiscussStage = new GraphQLObjectType<any, GQLContext>({
  name: 'RetroDiscussStage',
  description: 'The stage where the team discusses a single theme',
  interfaces: () => [NewMeetingStage, DiscussionThreadStage],
  isTypeOf: ({phaseType}) => (phaseType as NewMeetingPhaseTypeEnum) === 'discuss',
  fields: () => ({
    ...newMeetingStageFields(),
    ...discussionThreadStageFields(),
    reflectionGroupId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'foreign key. use reflectionGroup'
    },
    reflectionGroup: {
      type: GraphQLNonNull(RetroReflectionGroup),
      description: 'the group that is the focal point of the discussion',
      resolve: async ({reflectionGroupId, meetingId}, _args, {dataLoader}) => {
        if (!reflectionGroupId) {
          const meeting = await dataLoader.get('newMeetings').load(meetingId)
          const prompts = await dataLoader
            .get('reflectPromptsByTemplateId')
            .load(meeting.templateId)
          return new ReflectionGroup({
            id: `${meetingId}:dummyGroup`,
            meetingId,
            promptId: prompts[0]?.id,
            title: 'Unknown'
          })
        }
        return dataLoader.get('retroReflectionGroups').load(reflectionGroupId)
      }
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The sort order for reprioritizing discussion topics'
    }
  })
})

export default RetroDiscussStage
