import getRethink from '../database/rethinkDriver'
import getPg from '../postgres/getPg'
import isCompanyDomain from './isCompanyDomain'

// Most used company domain for a given orgId
const getActiveDomainForOrgId = async (orgId: string) => {
  const r = await getRethink()
  const pg = getPg()

  const userIds = await r
    .table('OrganizationUser')
    .getAll(orgId, {index: 'orgId'})
    .filter({removedAt: null})('userId')
    .run()

  const countedDomains = await pg.query(
    `SELECT count(*) as "total", "domain" from "User"
     WHERE "id" = ANY($1::text[])
     GROUP BY "domain"
     ORDER BY "total" DESC`,
    [userIds]
  )

  const activeDomain = countedDomains.rows.find((row) => isCompanyDomain(row.domain))?.domain

  return activeDomain
}

export default getActiveDomainForOrgId
