import {expressionBuilder} from 'kysely'
import getKysely from '../../postgres/getKysely'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {isAnyOf, isTeamMemberAt, readingSteps, readReportRows} from '../reportQueries'

const readUsers = (query: ReportMeasureQuery) => {
  const steps = getKysely().selectFrom(readingSteps(query.readAt))
  if (query.isWholeOrg) {
    const from = steps.crossJoin('OrganizationUser as ou')
    const eb = expressionBuilder(from)
    return readReportRows(query, from, {
      where: [eb('ou.orgId', '=', query.orgId)],
      isPresentAt: (at) =>
        eb.and([
          eb('ou.joinedAt', '<=', at),
          eb.or([eb('ou.removedAt', 'is', null), eb('ou.removedAt', '>', at)])
        ]),
      dimensions: {},
      value: eb.cast<number>(eb.fn.count('ou.userId').distinct(), 'integer')
    })
  }
  const from = steps.crossJoin('TeamMember as mem')
  const eb = expressionBuilder(from)
  return readReportRows(query, from, {
    where: [isAnyOf(eb.ref('mem.teamId'), query.teamIds)],
    isPresentAt: (at) =>
      isTeamMemberAt(
        {
          createdAt: eb.ref('mem.createdAt'),
          isNotRemoved: eb.ref('mem.isNotRemoved'),
          updatedAt: eb.ref('mem.updatedAt')
        },
        at
      ),
    dimensions: {TEAM: eb.ref('mem.teamId')},
    value: eb.cast<number>(eb.fn.count('mem.userId').distinct(), 'integer')
  })
}

export default readUsers
