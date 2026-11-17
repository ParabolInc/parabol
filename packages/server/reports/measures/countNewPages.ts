import {expressionBuilder, sql} from 'kysely'
import getKysely from '../../postgres/getKysely'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {countReportRows, isAnyOf} from '../reportQueries'

// Only a top-level page names its team, so a page inside one belongs to the team of its top-level page
const selectPages = () =>
  getKysely()
    .selectFrom('Page as p')
    .leftJoin('Page as root', (join) =>
      join.on((eb) => eb('root.id', '=', sql<number>`p."ancestorIds"[1]`))
    )
    .innerJoin('User as pu', 'pu.id', 'p.userId')

const countNewPages = (query: ReportMeasureQuery) => {
  const eb = expressionBuilder(selectPages())
  const teamId = eb.fn.coalesce('root.teamId', 'p.teamId')
  return countReportRows(query, selectPages(), {
    where: [
      isAnyOf(teamId, query.teamIds),
      eb('p.isPrivate', '=', false),
      eb('p.deletedAt', 'is', null),
      eb('p.summaryMeetingId', 'is', null),
      eb('p.isMeetingTOC', '=', false)
    ],
    timestamp: eb.ref('p.createdAt'),
    dimensions: {TEAM: teamId, USER: eb.ref('p.userId')},
    labels: {USER: eb.ref('pu.preferredName')},
    value: eb.cast<number>(eb.fn.countAll(), 'integer')
  })
}

export default countNewPages
