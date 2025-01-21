import {sql} from 'kysely'
import {selectNewMeetings} from '../../../postgres/select'
import standardError from '../../../utils/standardError'
import {generateRetroSummary} from '../../mutations/helpers/generateRetroSummary'
import {MutationResolvers, RetrospectiveMeeting} from '../resolverTypes'

const generateRetroSummaries: MutationResolvers['generateRetroSummaries'] = async (
  _source,
  {teamIds, prompt},
  {dataLoader}
) => {
  const MIN_SECONDS = 60
  const MIN_REFLECTION_COUNT = 3

  const endDate = new Date()
  const twoYearsAgo = new Date()
  twoYearsAgo.setFullYear(endDate.getFullYear() - 2)

  const rawMeetingsWithAnyMembers = await selectNewMeetings()
    .where('teamId', 'in', teamIds)
    .where('meetingType', '=', 'retrospective')
    .where('createdAt', '>=', twoYearsAgo)
    .where('createdAt', '<=', endDate)
    .where('reflectionCount', '>', MIN_REFLECTION_COUNT)
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

  if (rawMeetings.length === 0) {
    return standardError(new Error('No valid meetings found'))
  }

  const updatedMeetingIds = await Promise.all(
    rawMeetings.map(async (meeting) => {
      const newSummary = await generateRetroSummary(meeting.id, dataLoader, prompt as string)
      if (!newSummary) return null
      return meeting.id
    })
  )

  const filteredMeetingIds = updatedMeetingIds.filter(
    (meetingId): meetingId is string => meetingId !== null
  )

  if (filteredMeetingIds.length === 0) {
    return standardError(new Error('No summaries were generated'))
  }

  return {meetingIds: filteredMeetingIds}
}
export default generateRetroSummaries
