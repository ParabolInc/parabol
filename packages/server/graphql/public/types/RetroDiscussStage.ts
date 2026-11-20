import ReflectionGroup from '../../../database/types/ReflectionGroup'
import type {DiscussStage} from '../../../postgres/types/NewMeetingPhase'
import type {RetroDiscussStageResolvers} from '../resolverTypes'

export interface DiscussStageSource extends DiscussStage {
  meetingId: string
  teamId: string
}

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
  // retros started before June 2021 stored their placeholder stage without these
  reflectionGroupId: ({reflectionGroupId}) => reflectionGroupId ?? '',
  discussionId: ({discussionId}) => discussionId ?? '',
  discussion: async ({discussionId, reflectionGroupId}, _args, {dataLoader}) => {
    if (!reflectionGroupId) return DUMMY_DISCUSSION
    return dataLoader.get('discussions').loadNonNull(discussionId)
  },

  reflectionGroup: async ({reflectionGroupId, meetingId}, _args, {dataLoader}) => {
    const reflectionGroup = reflectionGroupId
      ? await dataLoader.get('retroReflectionGroups').load(reflectionGroupId)
      : undefined
    if (reflectionGroup) return reflectionGroup
    // some old meetings have stages whose reflection group no longer exists
    const prompts = await dataLoader.get('templatePromptsByMeetingId').load(meetingId)
    return new ReflectionGroup({
      id: reflectionGroupId || `${meetingId}:dummyGroup`,
      meetingId,
      promptId: prompts[0]!.id,
      title: 'Unknown'
    })
  }
}

export default RetroDiscussStage
