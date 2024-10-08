import ReflectionGroup from '../../../database/types/ReflectionGroup'
import {RetroDiscussStageResolvers} from '../resolverTypes'

// note: this is the GraphQL type, not source DB type
const DUMMY_DISCUSSION = {
  id: 'dummy-discussion-id',
  teamId: '',
  meetingId: '',
  createdAt: new Date('2016-06-01'),
  discussionTopicId: '',
  discussionTopicType: 'reflectionGroup' as const,
  commentCount: 0,
  thread: {
    edges: []
  },
  commentors: [],
  summary: ''
} as const

const RetroDiscussStage: RetroDiscussStageResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'discuss',
  discussion: async ({discussionId, reflectionGroupId}, _args, {dataLoader}) => {
    const isDummy = reflectionGroupId === ''
    return isDummy ? DUMMY_DISCUSSION : dataLoader.get('discussions').loadNonNull(discussionId)
  },

  reflectionGroup: async ({reflectionGroupId, meetingId}, _args, {dataLoader}) => {
    if (!reflectionGroupId) {
      const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
      if (!('templateId' in meeting)) throw new Error('Meeting has no template')
      const prompts = await dataLoader.get('reflectPromptsByTemplateId').load(meeting.templateId!)
      return new ReflectionGroup({
        id: `${meetingId}:dummyGroup`,
        meetingId,
        promptId: prompts[0]!.id,
        title: 'Unknown'
      })
    }
    return dataLoader.get('retroReflectionGroups').loadNonNull(reflectionGroupId)
  }
}

export default RetroDiscussStage
