import {GraphQLFloat, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
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
    },
    topicSummary: {
      type: new GraphQLNonNull(GraphQLString),
      description: `The GPT-3 generated summary of this topic's reflection group`,
      resolve: async (src, _args, {dataLoader}) => {
        // const manager = new OpenAIServerManager()
        const string = `Summarize this for a second-grade student:

        Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass one-thousandth that of the Sun, but two-and-a-half times that of all the other planets in the Solar System combined. Jupiter is one of the brightest objects visible to the naked eye in the night sky, and has been known to ancient civilizations since before recorded history. It is named after the Roman god Jupiter.[19] When viewed from Earth, Jupiter can be bright enough for its reflected light to cast visible shadows,[20] and is on average the third-brightest natural object in the night sky after the Moon and Venus.`
        // const testa = await manager.getSummary(string)
        // console.log('🚀 ~ testa/./.........', testa)
        return string
      }
    }
  })
})

export default RetroDiscussStage
