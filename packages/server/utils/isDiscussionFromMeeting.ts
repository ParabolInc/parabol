import {AnyMeeting} from '../postgres/types/Meeting'
import getPhase from './getPhase'

export const isDiscussionFromMeeting = (discussionId: string, meeting: AnyMeeting) => {
  const {meetingType} = meeting
  if (meetingType === 'retrospective') {
    const discussPhase = getPhase(meeting.phases, 'discuss')
    const discussionIds = discussPhase.stages.map(({discussionId}) => discussionId)
    return discussionIds.includes(discussionId)
  } else if (meetingType === 'poker') {
    const estimatePhase = getPhase(meeting.phases, 'ESTIMATE')
    const discussionIds = estimatePhase.stages.map(({discussionId}) => discussionId)
    return discussionIds.includes(discussionId)
  }
  return false
}
