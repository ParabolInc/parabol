import yaml from 'js-yaml'
import {sql} from 'kysely'
import {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import getKysely from '../../../../postgres/getKysely'
import {RetrospectiveMeeting} from '../../../../postgres/types/Meeting'
import OpenAIServerManager from '../../../../utils/OpenAIServerManager'
import standardError from '../../../../utils/standardError'

export const getSummaries = async (
  teamId: string,
  startDate: Date,
  endDate: Date,
  dataLoader: DataLoaderInstance,
  prompt?: string | null
) => {
  const pg = getKysely()
  const MIN_SECONDS = 60
  const MIN_REFLECTION_COUNT = 3
  const rawMeetingsWithAnyMembers = await pg
    .selectFrom('NewMeeting')
    .select(['id', 'name', 'createdAt', 'summary'])
    .where('teamId', '=', teamId)
    .where('summary', 'is not', null)
    .where('meetingType', '=', 'retrospective')
    .where('createdAt', '>=', startDate)
    .where('createdAt', '<=', endDate)
    .where('reflectionCount', '>=', MIN_REFLECTION_COUNT)
    .where(sql<boolean>`EXTRACT(EPOCH FROM ("endedAt" - "createdAt")) > ${MIN_SECONDS}`)
    .$narrowType<RetrospectiveMeeting>()
    .execute()
  const allMeetingMembers = await dataLoader
    .get('meetingMembersByMeetingId')
    .loadMany(rawMeetingsWithAnyMembers.map(({id}) => id))

  const rawMeetings = rawMeetingsWithAnyMembers.filter((_, idx) => {
    const meetingMembers = allMeetingMembers[idx]
    return Array.isArray(meetingMembers) && meetingMembers.length > 1
  })

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
