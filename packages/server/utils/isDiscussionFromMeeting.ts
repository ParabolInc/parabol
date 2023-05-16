import {AnyMeeting} from '../postgres/types/Meeting'
import getPhase from './getPhase'

export const isDiscussionFromMeeting = (discussionId: string, meeting: AnyMeeting) => {
  const {meetingType} = meeting
  if (meetingType === 'retrospective') {
    const discussPhase = getPhase(meeting.phases, 'discuss')
    return discussPhase.stages.some((stage) => stage.discussionId === discussionId)
  } else if (meetingType === 'poker') {
    const estimatePhase = getPhase(meeting.phases, 'ESTIMATE')
    return estimatePhase.stages.some((stage) => stage.discussionId === discussionId)
  }
  return false
}
