import type {DataLoaderInstance} from '../../../dataloader/RootDataLoader'

export interface RetroDiscussionRef {
  meetingName: string
  topicTitle: string
  url: string
}

// Resolves the retrospective discussion a task belongs to, returning the meeting name,
// topic title, and a URL deep-linking to the discussion stage. Returns null when the
// task is not a retrospective task with a discussionId.
//
// Shared between Task.retroDiscussion (live GraphQL resolver) and getTaskBlocks (summary
// page snapshot) so both surfaces produce the same label and link.
const computeRetroDiscussion = async (
  meetingId: string | null | undefined,
  discussionId: string | null | undefined,
  dataLoader: DataLoaderInstance
): Promise<RetroDiscussionRef | null> => {
  if (!meetingId || !discussionId) return null
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting || meeting.meetingType !== 'retrospective') return null
  const discussPhase = meeting.phases.find(
    (phase): phase is Extract<typeof phase, {phaseType: 'discuss'}> => phase.phaseType === 'discuss'
  )
  if (!discussPhase) return null
  const sortedStages = [...discussPhase.stages].sort((a, b) => a.sortOrder - b.sortOrder)
  const stageIdx = sortedStages.findIndex((stage) => stage.discussionId === discussionId)
  if (stageIdx === -1) return null
  const reflectionGroupId = sortedStages[stageIdx]?.reflectionGroupId
  if (!reflectionGroupId) return null
  const reflectionGroup = await dataLoader.get('retroReflectionGroups').load(reflectionGroupId)
  return {
    meetingName: meeting.name,
    topicTitle: reflectionGroup?.title || 'Untitled topic',
    url: `/meet/${meetingId}/discuss/${stageIdx + 1}`
  }
}

export default computeRetroDiscussion
