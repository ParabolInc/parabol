import {expressionBuilder, sql} from 'kysely'
import getKysely from '../../postgres/getKysely'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {isAnyOf, readingSteps, readReportRows} from '../reportQueries'

// Slack keeps its own table. A disconnected integration is dated by its last update
const selectConnections = () =>
  getKysely()
    .selectFrom('TeamMemberIntegrationAuth')
    .select(({cast}) => [
      'userId',
      'teamId',
      cast<string>('service', 'text').as('service'),
      'createdAt',
      'isActive',
      'updatedAt'
    ])
    .unionAll(
      getKysely()
        .selectFrom('SlackAuth')
        .select([
          'userId',
          'teamId',
          sql.lit<string>('slack').as('service'),
          'createdAt',
          'isActive',
          'updatedAt'
        ])
    )

const readUserIntegrations = (query: ReportMeasureQuery) => {
  const from = getKysely()
    .selectFrom(readingSteps(query.readAt))
    .crossJoin(selectConnections().as('c'))
  const eb = expressionBuilder(from)
  return readReportRows(query, from, {
    where: [isAnyOf(eb.ref('c.teamId'), query.teamIds)],
    isPresentAt: (at) =>
      eb.and([
        eb('c.createdAt', '<=', at),
        eb.or([eb.ref('c.isActive'), eb('c.updatedAt', '>', at)])
      ]),
    dimensions: {
      TEAM: eb.ref('c.teamId'),
      INTEGRATION: eb.ref('c.service')
    },
    value: eb.cast<number>(eb.fn.count(eb.refTuple('c.userId', 'c.service')).distinct(), 'integer')
  })
}

export default readUserIntegrations
