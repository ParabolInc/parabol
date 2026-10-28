import {sql} from 'kysely'
import getKysely from '../postgres/getKysely'

const MATCH_WINDOW_MS = 30 * 60 * 1000 // ±30 minutes

type HostAuth = {
  userId: string
  teamId: string
}

export const matchExternalMeetingToMeeting = async (
  meetingEndedAt: Date,
  hostAuths: HostAuth[]
) => {
  if (hostAuths.length === 0) return null
  const hostUserIds = [...new Set(hostAuths.map(({userId}) => userId))]
  const connectedTeamIds = [...new Set(hostAuths.map(({teamId}) => teamId))]
  const windowStart = new Date(meetingEndedAt.getTime() - MATCH_WINDOW_MS)
  const windowEnd = new Date(meetingEndedAt.getTime() + MATCH_WINDOW_MS)

  const meeting = await getKysely()
    .selectFrom('NewMeeting')
    .innerJoin('TeamMember', (join) =>
      join
        .onRef('TeamMember.teamId', '=', 'NewMeeting.teamId')
        .on('TeamMember.userId', 'in', hostUserIds)
        .on('TeamMember.isNotRemoved', '=', true)
    )
    .select([
      'NewMeeting.teamId',
      'NewMeeting.name',
      'NewMeeting.summaryPageId',
      'TeamMember.userId'
    ])
    .where('NewMeeting.endedAt', '>=', windowStart)
    .where('NewMeeting.endedAt', '<=', windowEnd)
    .where('NewMeeting.summaryPageId', 'is not', null)
    // the host may run the call without joining the Parabol meeting, or join it on a team they never connected from
    .where((eb) =>
      eb.or([
        eb('NewMeeting.teamId', 'in', connectedTeamIds),
        eb.exists(
          eb
            .selectFrom('MeetingMember')
            .select(sql.lit(1).as('one'))
            .whereRef('MeetingMember.meetingId', '=', 'NewMeeting.id')
            .whereRef('MeetingMember.userId', '=', 'TeamMember.userId')
        )
      ])
    )
    .orderBy(
      sql<number>`ABS(EXTRACT(EPOCH FROM ("NewMeeting"."endedAt" - ${meetingEndedAt.toISOString()}::timestamptz)))`,
      'asc'
    )
    .limit(1)
    .$narrowType<{summaryPageId: number}>()
    .executeTakeFirst()

  return meeting ?? null
}
