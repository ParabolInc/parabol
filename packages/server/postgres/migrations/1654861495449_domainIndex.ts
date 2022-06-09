import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  CREATE INDEX IF NOT EXISTS "idx_OrganizationApprovedDomain_domain" ON "OrganizationApprovedDomain"("domain");`)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DROP INDEX IF EXISTS "idx_OrganizationApprovedDomain_domain" ON "OrganizationApprovedDomain"("domain");`)
  await client.end()
}
