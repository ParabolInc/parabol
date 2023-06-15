import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

const organizationApprovedDomains = process.env.ORGANIZATION_APPROVED_DOMAINS?.split(',')

export async function up() {
  if (!organizationApprovedDomains) return
  const client = new Client(getPgConfig())
  await client.connect()
  await Promise.all(
    organizationApprovedDomains.map((domain) =>
      client.query(
        `INSERT INTO "OrganizationApprovedDomain" (domain, "orgId", "addedByUserId") VALUES ($1, 'aGhostOrg', 'aGhostUser')`,
        [domain]
      )
    )
  )
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(
    `DELETE FROM "OrganizationApprovedDomain" WHERE "orgId" = 'aGhostOrg' AND "addedByUserId" = 'aGhostUser'`
  )
  await client.end()
}
