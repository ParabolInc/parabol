import getPg from '../../../../postgres/getPg'

const domainFilterFields = ['createdAt', 'lastSeenAt'] as const
type DomainFilterField = typeof domainFilterFields[number]
type DomainTotal = {domain: string; total: number}

const authCountByDomain = async (
  after: Date | null | undefined,
  countOnlyActive: boolean | null | undefined,
  filterField: DomainFilterField
) => {
  // This function is only used internally, but that might change
  if (!domainFilterFields.includes(filterField)) throw new Error('Possible SQL injection')

  const pg = getPg()

  const count = after
    ? await pg.query<DomainTotal>(
        `SELECT count(*)::float as "total", "domain" from "User"
         WHERE (NOT $1 OR "inactive" = FALSE)
         AND "${filterField}" >= $2
         GROUP BY "domain"
         ORDER BY "total" DESC`,
        [countOnlyActive ?? false, after]
      )
    : await pg.query<DomainTotal>(
        `SELECT count(*)::float as "total", "domain" from "User"
         WHERE (NOT $1 OR "inactive" = FALSE)
         GROUP BY "domain"
         ORDER BY "total" DESC`,
        [countOnlyActive ?? false]
      )
  return count.rows
}

export default authCountByDomain
