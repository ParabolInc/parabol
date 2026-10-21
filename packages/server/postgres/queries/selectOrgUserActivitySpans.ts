import {type Expression, sql} from 'kysely'
import getKysely from '../getKysely'

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
  sql<boolean>`(
    ${span.eventType} IN ('added', 'activated')
    AND ${span.eventDate} < ${at}
    AND (${span.nextEventDate} IS NULL OR ${span.nextEventDate} >= ${at})
  )`

export default selectOrgUserActivitySpans
