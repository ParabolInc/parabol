import plural from 'parabol-client/utils/plural'
import relativeDate from 'parabol-client/utils/date/relativeDate'
import {AnyMeeting} from '../../../../postgres/types/Meeting'

const getSummaryText = (meeting: AnyMeeting) => {
  if (meeting.meetingType === 'retrospective') {
    const {commentCount = 0, reflectionCount = 0, topicCount = 0, taskCount = 0} = meeting
    return `Your team shared ${reflectionCount} ${plural(
      reflectionCount,
      'reflection'
    )} and grouped them into ${topicCount} topics.\nYou added ${commentCount} ${plural(
      commentCount,
      'comment'
    )} and created ${taskCount} ${plural(taskCount, 'task')}.`
  } else if (meeting.meetingType === 'action') {
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
  } else if (meeting.meetingType === 'teamPrompt') {
    return 'TODO: Implement teamPrompt summary text'
  } else {
    const {storyCount = 0, commentCount = 0} = meeting
    return `You voted on ${storyCount} ${plural(
      storyCount,
      'story',
      'stories'
    )} and added ${commentCount} ${plural(commentCount, 'comment')}.`
  }
}

export default getSummaryText
