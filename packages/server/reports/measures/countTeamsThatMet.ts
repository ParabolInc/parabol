import {expressionBuilder, sql} from 'kysely'
import getKysely from '../../postgres/getKysely'
import {hasEnoughMembers, isCountedMeetingInWindow} from '../../postgres/teamActivityCriteria'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {groupReportRows, isAnyOf, toTimestampArray} from '../reportQueries'

interface MeetingStep {
  start: Date
  end: Date
  index: number
}

const selectStepMeetings = ({teamIds, stepStarts, stepEnds}: ReportMeasureQuery) =>
  getKysely()
    .selectFrom(
      sql<MeetingStep>`unnest(${toTimestampArray(stepStarts)}, ${toTimestampArray(stepEnds)}) WITH ORDINALITY`.as<'Step'>(
        sql`${sql.id('Step')}(${sql.id('start')}, ${sql.id('end')}, ${sql.id('index')})`
      )
    )
    .innerJoin('NewMeeting as m', (join) =>
      join.on(({and, ref}) =>
        and([
          isAnyOf(ref('m.teamId'), teamIds),
          isCountedMeetingInWindow(
            {id: ref('m.id'), createdAt: ref('m.createdAt'), endedAt: ref('m.endedAt')},
            ref('Step.start'),
            ref('Step.end')
          )
        ])
      )
    )

// The same rule as activeTeamCount, applied to each step instead of the last 30 days
const countTeamsThatMet = (query: ReportMeasureQuery) => {
  const from = selectStepMeetings(query)
  const eb = expressionBuilder(from)
  return groupReportRows(query, from, {
    stepIndex: eb.cast<number>('Step.index', 'integer'),
    where: [hasEnoughMembers(eb.ref('m.teamId'))],
    dimensions: {
      TEAM: eb.ref('m.teamId'),
      MEETING_TYPE: eb.cast<string>('m.meetingType', 'text')
    },
    value: eb.cast<number>(eb.fn.count('m.teamId').distinct(), 'integer')
  })
}

export default countTeamsThatMet
