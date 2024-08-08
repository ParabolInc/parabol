import yaml from 'js-yaml'
import getRethink from '../../../../database/rethinkDriver'
import MeetingRetrospective from '../../../../database/types/MeetingRetrospective'
import OpenAIServerManager from '../../../../utils/OpenAIServerManager'
import standardError from '../../../../utils/standardError'

export const getSummaries = async (
  teamId: string,
  startDate: Date,
  endDate: Date,
  prompt?: string | null
) => {
  const r = await getRethink()
  const MIN_MILLISECONDS = 60 * 1000 // 1 minute
  const MIN_REFLECTION_COUNT = 3

  const rawMeetings = (await r
    .table('NewMeeting')
    .getAll(teamId, {index: 'teamId'})
    .filter((row: any) =>
      row('meetingType')
        .eq('retrospective')
        .and(row('createdAt').ge(startDate))
        .and(row('createdAt').le(endDate))
        .and(row('reflectionCount').gt(MIN_REFLECTION_COUNT))
        .and(r.table('MeetingMember').getAll(row('id'), {index: 'meetingId'}).count().gt(1))
        .and(row('endedAt').sub(row('createdAt')).gt(MIN_MILLISECONDS))
        .and(row.hasFields('summary'))
    )
    .run()) as MeetingRetrospective[]

  if (!rawMeetings.length) {
    return standardError(new Error('No meetings found'))
  }

  const summaries = rawMeetings.map((meeting) => ({
    meetingName: meeting.name,
    date: meeting.createdAt,
    summary: meeting.summary
  }))

  const yamlData = yaml.dump(summaries, {
    noCompatMode: true
  })

  const openAI = new OpenAIServerManager()
  const rawInsight = await openAI.generateInsight(yamlData, true, prompt)
  if (!rawInsight) {
    return standardError(new Error('No insights generated'))
  }

  return {
    wins: rawInsight.wins,
    challenges: rawInsight.challenges,
    meetingIds: rawMeetings.map((meeting) => meeting.id)
  }
}
