import {sql} from 'kysely'
import getKysely from '../postgres/getKysely'

const MATCH_WINDOW_MS = 30 * 60 * 1000 // ±30 minutes

export const matchExternalMeetingToMeeting = async (meetingEndedAt: Date, teamId: string) => {
  const pg = getKysely()
  const windowStart = new Date(meetingEndedAt.getTime() - MATCH_WINDOW_MS)
  const windowEnd = new Date(meetingEndedAt.getTime() + MATCH_WINDOW_MS)

  const meeting = await pg
    .selectFrom('NewMeeting')
    .selectAll()
    .where('teamId', '=', teamId)
    .where('endedAt', '>=', windowStart)
    .where('endedAt', '<=', windowEnd)
    .orderBy(
      sql<number>`ABS(EXTRACT(EPOCH FROM ("endedAt" - ${meetingEndedAt.toISOString()}::timestamptz)))`,
      'asc'
    )
    .limit(1)
    .executeTakeFirst()

  return meeting ?? null
}
