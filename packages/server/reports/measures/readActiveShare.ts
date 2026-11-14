import {type Expression, expressionBuilder} from 'kysely'
import getKysely from '../../postgres/getKysely'
import selectOrgUserActivitySpans, {
  isOrgUserActiveAt
} from '../../postgres/queries/selectOrgUserActivitySpans'
import type {DB} from '../../postgres/types/pg'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {isAnyOf, isTeamMemberAt, readingSteps, readReportRows} from '../reportQueries'

const eb = expressionBuilder<DB>()

// The members active at each reading as a percentage of all the members then, or null without members
const percentActive = (activeId: Expression<string | null>, memberId: Expression<string>) =>
  eb.cast<number>(
    eb.fn('round', [
      eb(
        eb(eb.cast(eb.lit(100), 'numeric'), '*', eb.fn.count(activeId).distinct()),
        '/',
        eb.fn('nullif', [eb.fn.count(memberId).distinct(), eb.lit(0)])
      ),
      eb.lit(1)
    ]),
    'float8'
  )

const readActiveShare = (query: ReportMeasureQuery) => {
  const {orgId, readAt, isWholeOrg, teamIds} = query
  const steps = getKysely().selectFrom(readingSteps(readAt))
  const spans = selectOrgUserActivitySpans(orgId).as('s')
  if (isWholeOrg) {
    const from = steps.crossJoin('OrganizationUser as ou').leftJoin(spans, (join) =>
      join.onRef('s.userId', '=', 'ou.userId').on(({ref}) =>
        isOrgUserActiveAt(
          {
            eventType: ref('s.eventType'),
            eventDate: ref('s.eventDate'),
            nextEventDate: ref('s.nextEventDate')
          },
          ref('Step.readAt')
        )
      )
    )
    const {ref} = expressionBuilder(from)
    return readReportRows(query, from, {
      where: [eb(ref('ou.orgId'), '=', orgId)],
      isPresentAt: (at) =>
        eb.and([
          eb(ref('ou.joinedAt'), '<=', at),
          eb.or([eb(ref('ou.removedAt'), 'is', null), eb(ref('ou.removedAt'), '>', at)])
        ]),
      dimensions: {},
      value: percentActive(ref('s.userId'), ref('ou.userId'))
    })
  }
  const from = steps.crossJoin('TeamMember as mem').leftJoin(spans, (join) =>
    join.onRef('s.userId', '=', 'mem.userId').on(({ref}) =>
      isOrgUserActiveAt(
        {
          eventType: ref('s.eventType'),
          eventDate: ref('s.eventDate'),
          nextEventDate: ref('s.nextEventDate')
        },
        ref('Step.readAt')
      )
    )
  )
  const {ref} = expressionBuilder(from)
  return readReportRows(query, from, {
    where: [isAnyOf(ref('mem.teamId'), teamIds)],
    isPresentAt: (at) =>
      isTeamMemberAt(
        {
          createdAt: ref('mem.createdAt'),
          isNotRemoved: ref('mem.isNotRemoved'),
          updatedAt: ref('mem.updatedAt')
        },
        at
      ),
    dimensions: {TEAM: ref('mem.teamId')},
    value: percentActive(ref('s.userId'), ref('mem.userId'))
  })
}

export default readActiveShare
