import getKysely from '../../../postgres/getKysely'
import {sql} from 'kysely'
import {MutationResolvers} from '../resolverTypes'

const runOrgActivityReport: MutationResolvers['runOrgActivityReport'] = async (
  _source,
  {startDate, endDate}
) => {
  const pg = getKysely()
  const now = new Date()
  const queryEndDate = endDate || now
  const queryStartDate = startDate || new Date(0) // Unix epoch start if not provided

  const query = sql`
    WITH months AS (
      SELECT generate_series(
        date_trunc('month', ${queryStartDate}::date),
        date_trunc('month', ${queryEndDate}::date),
        '1 month'::interval
      ) AS month_start
    ),
    user_signups AS (
      SELECT
        date_trunc('month', "createdAt") AS month,
        COUNT(DISTINCT "id") AS signup_count
      FROM "User"
      WHERE "createdAt" BETWEEN ${queryStartDate} AND ${queryEndDate}
      GROUP BY month
    ),
    user_logins AS (
      SELECT
        date_trunc('month', "lastSeenAt") AS month,
        COUNT(DISTINCT "id") AS login_count
      FROM "User"
      WHERE "lastSeenAt" BETWEEN ${queryStartDate} AND ${queryEndDate}
      GROUP BY month
    )
    SELECT
      m.month_start,
      (m.month_start + interval '1 month' - interval '1 day')::date AS "lastDayOfMonth",
      'All Organizations' AS "orgName",
      COALESCE(us.signup_count, 0) AS "signupCount",
      COALESCE(ul.login_count, 0) AS "loginCount"
    FROM months m
    LEFT JOIN user_signups us ON m.month_start = us.month
    LEFT JOIN user_logins ul ON m.month_start = ul.month
    ORDER BY m.month_start
  `

  try {
    const results = await query.execute(pg)
    return JSON.stringify(results, null, 2)
  } catch (error) {
    console.error('Error executing Org Activity Report:', error)
    return 'Error executing Org Activity Report'
  }
}

export default runOrgActivityReport
