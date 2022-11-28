import {GraphQLFloat, GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {NewMeetingPhaseTypeEnum} from '../../database/types/GenericMeetingPhase'
import MeetingRetrospective from '../../database/types/MeetingRetrospective'
import ReflectionGroup from '../../database/types/ReflectionGroup'
import {GQLContext} from '../graphql'
import Discussion from './Discussion'
import DiscussionThreadStage, {discussionThreadStageFields} from './DiscussionThreadStage'
import NewMeetingStage, {newMeetingStageFields} from './NewMeetingStage'
import RetroReflectionGroup from './RetroReflectionGroup'

const DUMMY_DISCUSSION = {
  id: 'dummy-discussion-id',
  teamId: '',
  meetingId: '',
  createdAt: '',
  discussionTopicId: '',
  discussionTopicType: '',
  commentCount: 0,
  thread: {
    edges: []
  }
}

const RetroDiscussStage = new GraphQLObjectType<any, GQLContext>({
  name: 'RetroDiscussStage',
  description: 'The stage where the team discusses a single theme',
  interfaces: () => [NewMeetingStage, DiscussionThreadStage],
  isTypeOf: ({phaseType}) => (phaseType as NewMeetingPhaseTypeEnum) === 'discuss',
  fields: () => ({
    ...newMeetingStageFields(),
    ...discussionThreadStageFields(),
    discussion: {
      type: new GraphQLNonNull(Discussion),
      description: 'The discussion about the stage or a dummy data when there is no disscussion',
      resolve: async ({discussionId, reflectionGroupId}, _args: unknown, {dataLoader}) => {
        const isDummy = reflectionGroupId === ''
        return isDummy ? DUMMY_DISCUSSION : dataLoader.get('discussions').load(discussionId)
      }
    },
    reflectionGroupId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'foreign key. use reflectionGroup'
    },
    reflectionGroup: {
      type: new GraphQLNonNull(RetroReflectionGroup),
      description: 'the group that is the focal point of the discussion',
      resolve: async ({reflectionGroupId, meetingId}, _args: unknown, {dataLoader}) => {
        if (!reflectionGroupId) {
          const meeting = (await dataLoader
            .get('newMeetings')
            .load(meetingId)) as MeetingRetrospective
          const prompts = await dataLoader
            .get('reflectPromptsByTemplateId')
            .load(meeting.templateId)
          return new ReflectionGroup({
            id: `${meetingId}:dummyGroup`,
            meetingId,
            promptId: prompts[0]!.id,
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
