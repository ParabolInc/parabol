import {type Expression, expressionBuilder} from 'kysely'
import getKysely from '../getKysely'
import type {DB} from '../types/pg'

const eb = expressionBuilder<DB>()

const selectOrgUserActivitySpans = (orgId: string) =>
  getKysely()
    .selectFrom('OrganizationUserAudit')
    .select(({fn}) => [
      'userId',
      'eventDate',
      'eventType',
      fn
        .agg<Date | null>('lead', ['eventDate'])
        .over((ob) => ob.partitionBy('userId').orderBy('eventDate').orderBy('id'))
        .as('nextEventDate')
    ])
    .where('orgId', '=', orgId)

// A member is active from an added or activated event until their next audit event, the same rule billing uses
export const isOrgUserActiveAt = (
  span: {
    eventType: Expression<string>
    eventDate: Expression<Date>
    nextEventDate: Expression<Date | null>
  },
  at: Expression<Date>
) =>
  eb.and([
    eb(span.eventType, 'in', ['added', 'activated']),
    eb(span.eventDate, '<', at),
    eb.or([eb(span.nextEventDate, 'is', null), eb(span.nextEventDate, '>=', at)])
  ])

export default selectOrgUserActivitySpans
