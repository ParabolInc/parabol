import getPg from '../../../../postgres/getPg'

const domainFilterFields = ['createdAt', 'lastSeenAt'] as const
type DomainFilterField = typeof domainFilterFields[number]

const authCountByDomain = async (
  after: Date | null | undefined,
  countOnlyActive: boolean | null | undefined,
  filterField: DomainFilterField
) => {
  // This function is only used internally, but that might change
  if (!domainFilterFields.includes(filterField)) throw new Error('Possible SQL injection')

  const pg = getPg()

  const count = after
    ? await pg.query(
        `SELECT count(*) as total, split_part(email, '@', 2) as "domain" from "User"
         WHERE (NOT $1 OR inactive = FALSE)
         AND "${filterField}" >= $2
         GROUP BY split_part(email, '@', 2)
         `,
        [countOnlyActive ?? false, after]
      )
    : await pg.query(
        `SELECT count(*) as total, split_part(email, '@', 2) as "domain" from "User"
         WHERE (NOT $1 OR inactive = FALSE)
         GROUP BY split_part(email, '@', 2)`,
        [countOnlyActive ?? false]
      )
  return count.rows as {domain: string; total: number}[]
}

export default authCountByDomain
