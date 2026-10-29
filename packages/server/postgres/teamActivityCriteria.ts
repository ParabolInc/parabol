import {type Expression, expressionBuilder} from 'kysely'
import {Threshold} from 'parabol-client/types/constEnums'
import type {DB} from './types/pg'

const eb = expressionBuilder<DB>()

export const hasEnoughAttendees = (meetingId: Expression<string>) =>
  eb.exists(
    eb
      .selectFrom('MeetingMember')
      .select(eb.lit(1).as('attended'))
      .where('MeetingMember.meetingId', '=', meetingId)
      .offset(Threshold.MIN_ACTIVE_TEAM_MEETING_ATTENDEES - 1)
  )

export const hasEnoughMembers = (teamId: Expression<string>) =>
  eb(
    eb
      .selectFrom('TeamMember')
      .select(eb.fn.countAll().as('memberCount'))
      .where('TeamMember.teamId', '=', teamId)
      .where('TeamMember.isNotRemoved', '=', true)
      .$asScalar(),
    '>=',
    Threshold.MIN_ACTIVE_TEAM_MEMBERS
  )

export const isCountedMeetingInWindow = (
  meeting: {id: Expression<string>; createdAt: Expression<Date>; endedAt: Expression<Date | null>},
  start: Expression<Date> | Date,
  end: Expression<Date> | Date
) =>
  eb.and([
    eb.or([
      eb.and([eb(meeting.createdAt, '>=', start), eb(meeting.createdAt, '<', end)]),
      eb.and([eb(meeting.endedAt, '>=', start), eb(meeting.endedAt, '<', end)])
    ]),
    hasEnoughAttendees(meeting.id)
  ])
