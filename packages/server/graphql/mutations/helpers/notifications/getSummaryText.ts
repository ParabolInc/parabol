import relativeDate from 'parabol-client/utils/date/relativeDate'
import plural from 'parabol-client/utils/plural'
import Meeting from '../../../../database/types/Meeting'
import {isMeetingAction} from '../../../../database/types/MeetingAction'
import {isMeetingPoker} from '../../../../database/types/MeetingPoker'
import {isMeetingRetrospective} from '../../../../database/types/MeetingRetrospective'
import {isMeetingTeamPrompt} from '../../../../database/types/MeetingTeamPrompt'
import sendToSentry from '../../../../utils/sendToSentry'

const getSummaryText = (meeting: Meeting) => {
  if (isMeetingRetrospective(meeting)) {
    const {commentCount = 0, reflectionCount = 0, topicCount = 0, taskCount = 0} = meeting
    const hasNonZeroStat = commentCount || reflectionCount || topicCount || taskCount
    if (!hasNonZeroStat && meeting.summary) {
      sendToSentry(new Error('No stats found for meeting'), {
        tags: {meetingId: meeting.id, summary: meeting.summary}
      })
    }
    return `Your team shared ${reflectionCount} ${plural(
      reflectionCount,
      'reflection'
    )} and grouped them into ${topicCount} topics.\nYou added ${commentCount} ${plural(
      commentCount,
      'comment'
    )} and created ${taskCount} ${plural(taskCount, 'task')}.`
  } else if (isMeetingAction(meeting)) {
    const {createdAt, endedAt, agendaItemCount = 0, commentCount = 0, taskCount = 0} = meeting
    const meetingDuration = relativeDate(createdAt, {
      now: endedAt,
      max: 2,
      suffix: false,
      smallDiff: 'less than a minute'
    })
    return `It lasted ${meetingDuration} and generated ${taskCount} ${plural(
      taskCount,
      'task'
    )}, ${agendaItemCount} ${plural(agendaItemCount, 'agenda item')} and ${commentCount} ${plural(
      commentCount,
      'comment'
    )}.`
  } else if (isMeetingTeamPrompt(meeting)) {
    return 'TODO: Implement teamPrompt summary text'
  } else if (isMeetingPoker(meeting)) {
    const {storyCount = 0, commentCount = 0} = meeting
    return `You voted on ${storyCount} ${plural(
      storyCount,
      'story',
      'stories'
    )} and added ${commentCount} ${plural(commentCount, 'comment')}.`
  } else {
    throw new Error(`Meeting type not supported ${meeting.meetingType}`)
  }
}

export default getSummaryText
