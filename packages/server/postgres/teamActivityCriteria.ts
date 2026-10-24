import {type Expression, sql} from 'kysely'
import {Threshold} from 'parabol-client/types/constEnums'

export const hasEnoughAttendees = (meetingId: Expression<string>) =>
  sql<boolean>`EXISTS (
    SELECT 1 FROM "MeetingMember" WHERE "MeetingMember"."meetingId" = ${meetingId}
    OFFSET ${Threshold.MIN_ACTIVE_TEAM_MEETING_ATTENDEES - 1}
  )`

export const hasEnoughMembers = (teamId: Expression<string>) =>
  sql<boolean>`(
    SELECT count(*) FROM "TeamMember"
    WHERE "TeamMember"."teamId" = ${teamId} AND "TeamMember"."isNotRemoved" = true
  ) >= ${Threshold.MIN_ACTIVE_TEAM_MEMBERS}`

export const isCountedMeetingInWindow = (
  meeting: {id: Expression<string>; createdAt: Expression<Date>; endedAt: Expression<Date | null>},
  start: Expression<Date> | Date,
  end: Expression<Date> | Date
) =>
  sql<boolean>`(
    ((${meeting.createdAt} >= ${start} AND ${meeting.createdAt} < ${end})
      OR (${meeting.endedAt} >= ${start} AND ${meeting.endedAt} < ${end}))
    AND ${hasEnoughAttendees(meeting.id)}
  )`
