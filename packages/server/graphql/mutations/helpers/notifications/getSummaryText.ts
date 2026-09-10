import relativeDate from 'parabol-client/utils/date/relativeDate'
import plural from 'parabol-client/utils/plural'
import getKysely from '../../../../postgres/getKysely'
import {getTeamPromptResponsesByMeetingId} from '../../../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import type {AnyMeeting} from '../../../../postgres/types/Meeting'
import averageTeamHealthScore from '../../../../utils/averageTeamHealthScore'
import getTeamHealthDisplayComment from '../../../../utils/getTeamHealthDisplayComment'
import logError from '../../../../utils/logError'

const getSummaryText = async (meeting: AnyMeeting) => {
  if (meeting.meetingType === 'retrospective') {
    const commentCount = meeting.commentCount || 0
    const reflectionCount = meeting.reflectionCount || 0
    const topicCount = meeting.topicCount || 0
    const taskCount = meeting.taskCount || 0
    const hasNonZeroStat = commentCount || reflectionCount || topicCount || taskCount
    if (!hasNonZeroStat && meeting.summary) {
      logError(new Error('No stats found for meeting'), {
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
  } else if (meeting.meetingType === 'teamHealth') {
    const responses = await getKysely()
      .selectFrom('TeamHealthResponse')
      .select(['userId', 'score', 'comment', 'commentParaphrased', 'isAnonymous'])
      .where('meetingId', '=', meeting.id)
      .execute()
    const respondentCount = new Set(responses.map(({userId}) => userId)).size
    const scores = responses.flatMap(({score}) => (score === null ? [] : [score]))
    const averageScore = averageTeamHealthScore(scores)
    const commentCount = responses.filter(
      (response) => !!getTeamHealthDisplayComment(response)
    ).length
    const scoreText = averageScore === null ? '' : ` with an average score of ${averageScore}/5`
    return `${respondentCount} ${plural(respondentCount, 'team member')} responded${scoreText}.\nYou added ${commentCount} ${plural(commentCount, 'comment')}.`
  } else {
    throw new Error(`Meeting type not supported ${(meeting as any).meetingType}`)
  }
}

export default getSummaryText
