import {expressionBuilder} from 'kysely'
import getKysely from '../../postgres/getKysely'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {groupReportRows, isAnyOf, toEpochMilliseconds} from '../reportQueries'

// When each member last used Parabol, in milliseconds since the epoch. Only the latest time is kept, so the
// period can't change it
const findLastSeen = (query: ReportMeasureQuery) => {
  const {orgId, teamIds, isWholeOrg} = query
  if (isWholeOrg) {
    const from = getKysely()
      .selectFrom('OrganizationUser as ou')
      .innerJoin('User as u', 'u.id', 'ou.userId')
    const eb = expressionBuilder(from)
    return groupReportRows(query, from, {
      stepIndex: eb.lit(1),
      where: [eb('ou.orgId', '=', orgId), eb('ou.removedAt', 'is', null)],
      dimensions: {USER: eb.ref('u.id')},
      labels: {USER: eb.ref('u.preferredName')},
      value: toEpochMilliseconds(eb.fn.max('u.lastSeenAt'))
    })
  }
  const from = getKysely()
    .selectFrom('TeamMember as mem')
    .innerJoin('User as u', 'u.id', 'mem.userId')
  const eb = expressionBuilder(from)
  return groupReportRows(query, from, {
    stepIndex: eb.lit(1),
    where: [isAnyOf(eb.ref('mem.teamId'), teamIds), eb.ref('mem.isNotRemoved')],
    dimensions: {USER: eb.ref('u.id'), TEAM: eb.ref('mem.teamId')},
    labels: {USER: eb.ref('u.preferredName')},
    value: toEpochMilliseconds(eb.fn.max('u.lastSeenAt'))
  })
}

export default findLastSeen
