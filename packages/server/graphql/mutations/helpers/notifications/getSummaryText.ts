import relativeDate from 'parabol-client/utils/date/relativeDate'
import plural from 'parabol-client/utils/plural'
import {getTeamPromptResponsesByMeetingId} from '../../../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import {AnyMeeting} from '../../../../postgres/types/Meeting'
import sendToSentry from '../../../../utils/sendToSentry'

const getSummaryText = async (meeting: AnyMeeting) => {
  if (meeting.meetingType === 'retrospective') {
    const commentCount = meeting.commentCount || 0
    const reflectionCount = meeting.reflectionCount || 0
    const topicCount = meeting.topicCount || 0
    const taskCount = meeting.taskCount || 0
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
  } else if (meeting.meetingType === 'action') {
    const agendaItemCount = meeting.agendaItemCount || 0
    const commentCount = meeting.commentCount || 0
    const taskCount = meeting.taskCount || 0
    const {createdAt, endedAt} = meeting
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
    const responseCount = (await getTeamPromptResponsesByMeetingId(meeting.id)).filter(
      (response) => !!response.plaintextContent
    ).length
    // :TODO: (jmtaber129): Add additional stats here.
    return `Your team shared ${responseCount} ${plural(responseCount, 'response', 'responses')}.`
  } else if (meeting.meetingType === 'poker') {
    const storyCount = meeting.storyCount || 0
    const commentCount = meeting.commentCount || 0
    return `You voted on ${storyCount} ${plural(
      storyCount,
      'story',
      'stories'
    )} and added ${commentCount} ${plural(commentCount, 'comment')}.`
  } else {
    throw new Error(`Meeting type not supported ${(meeting as any).meetingType}`)
  }
}

export default getSummaryText
